import { useState } from 'react'
import useDonorData from '../hooks/useDonorData'
import { formatCurrency, formatCurrencyFull, formatNumber, formatPercent } from '../utils/formatters'
import { CHART_COLORS } from '../theme/themeConfig'
import BentoGrid from '../components/BentoGrid/BentoGrid'
import BentoCard from '../components/BentoCard/BentoCard'
import MetricCard from '../components/MetricCard/MetricCard'
import FilterBar from '../components/FilterBar/FilterBar'
import GivingOverTimeChart from '../components/charts/GivingOverTimeChart'
import MembershipStatusChart from '../components/charts/MembershipStatusChart'
import GiftTypeByYearChart from '../components/charts/GiftTypeByYearChart'
import TransactionVolumeChart from '../components/charts/TransactionVolumeChart'
import MembershipGivingDualAxis from '../components/charts/MembershipGivingDualAxis'
import DataTable from '../components/DataTable/DataTable'
import InsightsCard from '../components/InsightsCard/InsightsCard'
import './DonorDashboard.css'

const DONOR_COLUMNS = [
  { key: 'fullName', label: 'Donor Name', render: 'donorLink' },
  { key: 'membershipStatus', label: 'Member Status' },
  { key: 'totalGiven', label: 'Total Given', format: 'currency', align: 'right' },
  { key: 'transactionCount', label: 'Transactions', align: 'right' },
  { key: 'lastGiftYear', label: 'Last Gift Year', align: 'right' },
  { key: 'donorUrl', label: 'History', render: 'historyLink' },
]

function formatYoYValue(growth) {
  if (growth === null) return 'N/A'
  const arrow = growth >= 0 ? '↑' : '↓'
  return `${arrow} ${formatPercent(Math.abs(growth))}`
}

function GivingChartTitle({ giftTypes, selectedType, onSelect }) {
  const typeIndex = (giftTypes || []).indexOf(selectedType)
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
        {(giftTypes || []).map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <span>& Total Giving Over Time</span>
    </span>
  )
}

function GiftTypeByYearTable({ data, giftTypes }) {
  if (!data || !giftTypes || giftTypes.length === 0) return null

  // Find top 5 gift types by total
  const totals = giftTypes.map((type) => ({
    type,
    total: data.reduce((sum, row) => sum + (row[type] || 0), 0),
  }))
  totals.sort((a, b) => b.total - a.total)
  const top5Types = totals.slice(0, 5).map((t) => t.type)

  // Compute totals row
  const totalRow = {}
  top5Types.forEach((type) => {
    totalRow[type] = data.reduce((sum, row) => sum + (row[type] || 0), 0)
  })

  return (
    <div className="gift-type-totals">
      <div className="gift-type-table-scroll">
        <table className="gift-type-totals-table">
          <thead>
            <tr>
              <th>Year</th>
              {top5Types.map((type) => (
                <th key={type} className="text-right">
                  <span
                    className="gift-type-dot"
                    style={{ background: CHART_COLORS[giftTypes.indexOf(type) % CHART_COLORS.length] }}
                  />
                  {type}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.year}>
                <td className="gift-type-year">{row.year}</td>
                {top5Types.map((type) => (
                  <td key={type} className="text-right">
                    {formatCurrency(row[type] || 0)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="gift-type-total-row">
              <td className="gift-type-year">Total</td>
              {top5Types.map((type) => (
                <td key={type} className="text-right">
                  {formatCurrency(totalRow[type])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DonorDashboard() {
  const [filters, setFilters] = useState({
    yearStart: null,
    yearEnd: null,
    giftTypes: [],
    membershipStatuses: [],
  })
  const [overlayType, setOverlayType] = useState('Membership')

  const {
    isLoading,
    error,
    metrics,
    givingByYear,
    membershipStatus,
    giftTypeByYear,
    transactionVolume,
    allDonors,
    insights,
    filterOptions,
    filteredRowCount,
    totalRowCount,
    membershipByYear,
  } = useDonorData(filters)

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading donor data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="app-error">Error loading data: {error}</div>
  }

  const hasActiveFilters = filters.yearStart || filters.yearEnd
    || filters.giftTypes.length > 0 || filters.membershipStatuses.length > 0

  if (!metrics && !hasActiveFilters) {
    return <div className="app-error">No donor data found.</div>
  }

  if (!metrics && hasActiveFilters) {
    return (
      <div className="donor-dashboard">
        <div className="donor-dashboard-header">
          <h1 className="donor-dashboard-title">Donor Dashboard</h1>
        </div>
        <FilterBar filters={filters} onFilterChange={setFilters} options={filterOptions} />
        <div className="app-error">
          No data found for the applied filters.
          <button
            className="filter-reset-btn"
            onClick={() => setFilters({ yearStart: null, yearEnd: null, giftTypes: [], membershipStatuses: [] })}
          >
            Reset Filters
          </button>
        </div>
      </div>
    )
  }

  const isFiltered = filteredRowCount < totalRowCount

  const donorTableTitle = (() => {
    const parts = []
    if (filters.yearStart && filters.yearEnd) {
      parts.push(`${filters.yearStart}–${filters.yearEnd}`)
    } else if (filters.yearStart) {
      parts.push(`${filters.yearStart}+`)
    } else if (filters.yearEnd) {
      parts.push(`through ${filters.yearEnd}`)
    }
    if (filters.giftTypes.length > 0) {
      parts.push(filters.giftTypes.join(', '))
    }
    if (filters.membershipStatuses.length > 0) {
      parts.push(filters.membershipStatuses.join(', '))
    }
    return parts.length > 0
      ? `All Donors — ${parts.join(' · ')}`
      : 'All Donors'
  })()

  return (
    <div className="donor-dashboard">
      <div className="donor-dashboard-header">
        <h1 className="donor-dashboard-title">Donor Dashboard</h1>
        {isFiltered && (
          <span className="donor-dashboard-filter-badge">
            Showing {filteredRowCount.toLocaleString()} of {totalRowCount.toLocaleString()} records
          </span>
        )}
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} options={filterOptions} />

      {/* Key Metrics */}
      <div className="donor-metrics-row">
        <MetricCard label="Total Donors" value={formatNumber(metrics.totalDonors)} />
        <MetricCard label="Total Transactions" value={formatNumber(metrics.totalTransactions)} />
        <MetricCard label="Lifetime Giving" value={formatCurrency(metrics.lifetimeGiving)} />
        <MetricCard label="Avg Gift Size" value={formatCurrency(metrics.avgGiftSize)} />
        <MetricCard label="Peak Giving Year" value={String(metrics.peakGivingYear)} />
        <MetricCard
          label={`YoY Growth ${metrics.yoyYears ? `(${metrics.yoyYears})` : ''}`}
          value={formatYoYValue(metrics.yoyGrowth)}
        />
      </div>

      {/* Key Highlights - at the top, beneath metrics */}
      <BentoGrid>
        <BentoCard colSpan={4}>
          <InsightsCard insights={insights} />
        </BentoCard>
      </BentoGrid>

      {/* Charts */}
      <BentoGrid>
        <BentoCard
          title={
            <GivingChartTitle
              giftTypes={givingByYear.giftTypes}
              selectedType={overlayType}
              onSelect={setOverlayType}
            />
          }
          colSpan={3}
        >
          <GivingOverTimeChart
            data={givingByYear.data}
            giftTypes={givingByYear.giftTypes}
            selectedType={overlayType}
          />
        </BentoCard>

        <BentoCard title="Membership Status Breakdown">
          <MembershipStatusChart data={membershipStatus} />
        </BentoCard>

        <BentoCard title="Top 5 Gift Types by Year">
          <GiftTypeByYearTable
            data={giftTypeByYear.data}
            giftTypes={giftTypeByYear.giftTypes}
          />
        </BentoCard>

        <BentoCard title="Gift Type Dollar Breakdown by Year" colSpan={3}>
          <GiftTypeByYearChart
            data={giftTypeByYear.data}
            giftTypes={giftTypeByYear.giftTypes}
          />
        </BentoCard>

        <BentoCard title="Transaction Volume by Gift Type Over Time" colSpan={2}>
          <TransactionVolumeChart
            data={transactionVolume.data}
            giftTypes={transactionVolume.giftTypes}
          />
        </BentoCard>

        <BentoCard title="Membership Count & Total Giving by Year" colSpan={2}>
          <MembershipGivingDualAxis data={membershipByYear} />
        </BentoCard>

        <BentoCard title={donorTableTitle} colSpan={4}>
          <DataTable data={allDonors} columns={DONOR_COLUMNS} />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
