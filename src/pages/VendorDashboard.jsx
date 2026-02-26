import { useState, useRef, useCallback, useMemo } from 'react'
import useVendorData from '../hooks/useVendorData'
import { formatCurrency, formatCurrencyFull, formatNumber, formatPercent } from '../utils/formatters'
import { CHART_COLORS } from '../theme/themeConfig'
import { VENDOR_CATEGORY_MAP } from '../utils/vendorAggregations'
import BentoGrid from '../components/BentoGrid/BentoGrid'
import BentoCard from '../components/BentoCard/BentoCard'
import MetricCard from '../components/MetricCard/MetricCard'
import FilterBar from '../components/FilterBar/FilterBar'
import GivingOverTimeChart from '../components/charts/GivingOverTimeChart'
import MembershipStatusChart from '../components/charts/MembershipStatusChart'
import GiftTypeByYearChart from '../components/charts/GiftTypeByYearChart'
import TransactionVolumeChart from '../components/charts/TransactionVolumeChart'
import DataTable from '../components/DataTable/DataTable'
import InsightsCard from '../components/InsightsCard/InsightsCard'
import { exportAsImage, exportChartDataExcel, exportTableData, formatDateForExport } from '../utils/exportUtils'
import './VendorDashboard.css'

const VENDOR_COLUMNS = [
  { key: 'fullName', label: 'Vendor Name', render: 'donorLink', className: 'wrap-cell' },
  { key: 'totalSpent', label: 'Total Spent', format: 'currency', align: 'right' },
  { key: 'transactionCount', label: 'Transactions', align: 'right' },
  { key: 'lastPaymentYear', label: 'Last Payment', align: 'right' },
  { key: 'vendorUrl', label: 'History', render: 'historyLink' },
]

function formatYoYValue(growth) {
  if (growth === null) return 'N/A'
  const arrow = growth >= 0 ? '↑' : '↓'
  return `${arrow} ${formatPercent(Math.abs(growth))}`
}

function SpendingChartTitle({ categories, selectedType, onSelect }) {
  const typeIndex = (categories || []).indexOf(selectedType)
  const dropdownColor = selectedType !== 'None' && typeIndex >= 0
    ? CHART_COLORS[typeIndex % CHART_COLORS.length]
    : undefined

  return (
    <span className="giving-chart-title">
      <select
        className="overlay-dropdown"
        value={selectedType}
        onChange={(e) => onSelect(e.target.value)}
        style={dropdownColor ? {
          color: dropdownColor,
          borderColor: dropdownColor,
          backgroundColor: `${dropdownColor}15`,
        } : undefined}
      >
        <option value="None">None</option>
        {(categories || []).map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <span>& Total Spending Over Time</span>
    </span>
  )
}

function CategoryByYearTable({ data, categories }) {
  if (!data || !categories || categories.length === 0) return null

  const totals = categories.map((cat) => ({
    cat,
    total: data.reduce((sum, row) => sum + (row[cat] || 0), 0),
  }))
  totals.sort((a, b) => b.total - a.total)
  const top5 = totals.slice(0, 5).map((t) => t.cat)

  const totalRow = {}
  top5.forEach((cat) => {
    totalRow[cat] = data.reduce((sum, row) => sum + (row[cat] || 0), 0)
  })

  return (
    <div className="gift-type-totals">
      <div className="gift-type-table-scroll">
        <table className="gift-type-totals-table">
          <thead>
            <tr>
              <th>Year</th>
              {top5.map((cat) => (
                <th key={cat} className="text-right">
                  <span
                    className="gift-type-dot"
                    style={{ background: CHART_COLORS[categories.indexOf(cat) % CHART_COLORS.length] }}
                  />
                  {cat}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.year}>
                <td className="gift-type-year">{row.year}</td>
                {top5.map((cat) => (
                  <td key={cat} className="text-right">
                    {formatCurrency(row[cat] || 0)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="gift-type-total-row">
              <td className="gift-type-year">Total</td>
              {top5.map((cat) => (
                <td key={cat} className="text-right">
                  {formatCurrency(totalRow[cat])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function VendorDashboard() {
  const [filters, setFilters] = useState({
    yearStart: null,
    yearEnd: null,
    paymentTypes: [],
    categories: [],
  })
  const [overlayType, setOverlayType] = useState('None')
  const chartsRef = useRef(null)

  const {
    isLoading,
    error,
    metrics,
    spendingByYear,
    paymentTypeBreakdown,
    categoryByYear,
    transactionVolume,
    categoryVolume,
    allVendors,
    insights,
    filterOptions,
    filteredRows,
    filteredRowCount,
    totalRowCount,
  } = useVendorData(filters)

  // Merge spending totals with category data for the overlay chart
  const mergedSpendingData = useMemo(() => {
    if (!spendingByYear.data || !categoryByYear.data) return []
    const catByYear = {}
    categoryByYear.data.forEach((row) => {
      catByYear[row.year] = row
    })
    return spendingByYear.data.map((row) => {
      const catRow = catByYear[row.year] || {}
      return { ...row, ...catRow }
    })
  }, [spendingByYear.data, categoryByYear.data])

  const handleExportImage = useCallback(async () => {
    if (chartsRef.current) {
      await exportAsImage(chartsRef.current, 'vendor-dashboard')
    }
  }, [])

  const handleExportChartData = useCallback(() => {
    if (!metrics) return
    exportChartDataExcel({
      metrics,
      metricsTitle: 'Vendor Metrics',
      sheets: [
        { name: 'Spending by Year', data: spendingByYear.data },
        { name: 'Payment Type Breakdown', data: paymentTypeBreakdown },
        { name: 'Category by Year', data: categoryByYear.data },
        { name: 'Transaction Volume', data: transactionVolume.data },
        { name: 'Category Volume', data: categoryVolume.data },
      ],
      filename: 'vendor-chart-data',
    })
  }, [metrics, spendingByYear, paymentTypeBreakdown, categoryByYear, transactionVolume, categoryVolume])

  const handleExportTableData = useCallback(() => {
    if (!filteredRows) return
    const exportRows = filteredRows.map((r) => ({
      'Person ID': r.personId,
      'QB Transaction ID': r.qbTransactionId,
      'Full Name': r.fullName,
      'First Name': r.firstName,
      'Last Name': r.lastName,
      'Amount': r.amount,
      'Payment Date': formatDateForExport(r.paymentDate),
      'Payment Year': r.paymentYear,
      'Payment Month': r.paymentMonth,
      'Payment Type': r.paymentType,
      'Split Note': r.splitNote,
      'Memo': r.memo,
      'Lifetime Vending Total': r.lifetimeVendingTotal,
      'Last Vend Year': r.lastVendYear,
      'Transaction Source': r.transactionSource,
      'Record URL': r.recordUrl,
      'Vendor URL': r.vendorUrl,
    }))
    exportTableData(exportRows, 'vendor-transactions')
  }, [filteredRows])

  const exportHandlers = {
    onExportImage: handleExportImage,
    onExportChartData: handleExportChartData,
    onExportTableData: handleExportTableData,
    tableDataLabel: 'Export Transaction Data (Excel)',
  }

  const vendorFilterFields = [
    { type: 'yearRange', key: ['yearStart', 'yearEnd'], label: 'Year Range', options: filterOptions.years },
    { type: 'multiSelect', key: 'paymentTypes', label: 'Payment Type', options: filterOptions.paymentTypes },
    { type: 'multiSelect', key: 'categories', label: 'Category', options: filterOptions.categories },
  ]
  const clearVendorFilters = () => setFilters({ yearStart: null, yearEnd: null, paymentTypes: [], categories: [] })

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading vendor data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="app-error">Error loading data: {error}</div>
  }

  const hasActiveFilters = filters.yearStart || filters.yearEnd
    || filters.paymentTypes.length > 0 || filters.categories.length > 0

  if (!metrics && !hasActiveFilters) {
    return <div className="app-error">No vendor data found.</div>
  }

  if (!metrics && hasActiveFilters) {
    return (
      <div className="vendor-dashboard">
        <div className="vendor-dashboard-header">
          <h1 className="vendor-dashboard-title">Vendor Dashboard</h1>
        </div>
        <FilterBar filters={filters} onFilterChange={setFilters} fields={vendorFilterFields} clearFilters={clearVendorFilters} categoryInfoMap={VENDOR_CATEGORY_MAP} />
        <div className="app-error">
          No data found for the applied filters.
          <button
            className="filter-reset-btn"
            onClick={clearVendorFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>
    )
  }

  const isFiltered = filteredRowCount < totalRowCount

  const vendorTableTitle = (() => {
    const parts = []
    if (filters.yearStart && filters.yearEnd) {
      parts.push(`${filters.yearStart}–${filters.yearEnd}`)
    } else if (filters.yearStart) {
      parts.push(`${filters.yearStart}+`)
    } else if (filters.yearEnd) {
      parts.push(`through ${filters.yearEnd}`)
    }
    if (filters.paymentTypes.length > 0) {
      parts.push(filters.paymentTypes.join(', '))
    }
    if (filters.categories.length > 0) {
      parts.push(filters.categories.join(', '))
    }
    return parts.length > 0
      ? `All Vendors — ${parts.join(' · ')}`
      : 'All Vendors'
  })()

  return (
    <div className="vendor-dashboard">
      <div className="vendor-dashboard-header">
        <h1 className="vendor-dashboard-title">Vendor Dashboard</h1>
        {isFiltered && (
          <span className="vendor-dashboard-filter-badge">
            Showing {filteredRowCount.toLocaleString()} of {totalRowCount.toLocaleString()} records
          </span>
        )}
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} fields={vendorFilterFields} clearFilters={clearVendorFilters} exportHandlers={exportHandlers} categoryInfoMap={VENDOR_CATEGORY_MAP} />

      {/* Capture area for image export */}
      <div ref={chartsRef} className="export-capture-area">
      {/* Key Metrics */}
      <div className="vendor-metrics-row">
        <MetricCard label="Total Vendors" value={formatNumber(metrics.totalVendors)} />
        <MetricCard label="Total Transactions" value={formatNumber(metrics.totalTransactions)} />
        <MetricCard label="Lifetime Spending" value={formatCurrency(metrics.lifetimeSpending)} />
        <MetricCard label="Avg Payment Size" value={formatCurrency(metrics.avgPaymentSize)} />
        <MetricCard label="Peak Spending Year" value={String(metrics.peakSpendingYear)} />
        <MetricCard
          label={`YoY Growth ${metrics.yoyYears ? `(${metrics.yoyYears})` : ''}`}
          value={formatYoYValue(metrics.yoyGrowth)}
        />
      </div>

      {/* Key Highlights */}
      <BentoGrid>
        <BentoCard colSpan={4}>
          <InsightsCard insights={insights} />
        </BentoCard>
      </BentoGrid>

      {/* Charts */}
      <BentoGrid>
        <BentoCard
          title={
            <SpendingChartTitle
              categories={categoryByYear.categories}
              selectedType={overlayType}
              onSelect={setOverlayType}
            />
          }
          colSpan={3}
        >
          <GivingOverTimeChart
            data={mergedSpendingData}
            giftTypes={categoryByYear.categories}
            selectedType={overlayType}
            barLabel="Total Spending"
          />
        </BentoCard>

        <BentoCard title="Payment Type Breakdown">
          <MembershipStatusChart data={paymentTypeBreakdown} tooltipLabel="payments" />
        </BentoCard>

        <BentoCard title="Top 5 Categories by Year">
          <CategoryByYearTable
            data={categoryByYear.data}
            categories={categoryByYear.categories}
          />
        </BentoCard>

        <BentoCard title="Category Dollar Breakdown by Year" colSpan={3}>
          <GiftTypeByYearChart
            data={categoryByYear.data}
            giftTypes={categoryByYear.categories}
          />
        </BentoCard>

        <BentoCard title="Transaction Volume by Payment Type Over Time" colSpan={2}>
          <TransactionVolumeChart
            data={transactionVolume.data}
            giftTypes={transactionVolume.paymentTypes}
          />
        </BentoCard>

        <BentoCard title="Transaction Volume by Category Over Time" colSpan={2}>
          <TransactionVolumeChart
            data={categoryVolume.data}
            giftTypes={categoryVolume.categories}
          />
        </BentoCard>
      </BentoGrid>
      </div>{/* end capture area */}

      <BentoGrid>
        <BentoCard title={vendorTableTitle} colSpan={4}>
          <DataTable
            data={allVendors}
            columns={VENDOR_COLUMNS}
            searchPlaceholder="Search vendors..."
            breakdownKey="categoryBreakdown"
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
