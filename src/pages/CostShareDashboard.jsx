import { useState, useRef, useCallback } from 'react'
import useCostShareData from '../hooks/useCostShareData'
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters'
import { CHART_COLORS } from '../theme/themeConfig'
import BentoGrid from '../components/BentoGrid/BentoGrid'
import BentoCard from '../components/BentoCard/BentoCard'
import MetricCard from '../components/MetricCard/MetricCard'
import FilterBar from '../components/FilterBar/FilterBar'
import InsightsCard from '../components/InsightsCard/InsightsCard'
import DataTable from '../components/DataTable/DataTable'
import MembershipStatusChart from '../components/charts/MembershipStatusChart'
import FundingOverTimeChart from '../components/charts/FundingOverTimeChart'
import BMPDistributionChart from '../components/charts/BMPDistributionChart'
import EnvironmentalImpactChart from '../components/charts/EnvironmentalImpactChart'
import DualAxisTimelineChart from '../components/charts/DualAxisTimelineChart'
import BudgetOverviewChart from '../components/charts/BudgetOverviewChart'
import FundingBySourceChart from '../components/charts/FundingBySourceChart'
import CostShareMap from '../components/CostShareMap/CostShareMap'
import { exportAsImage, exportChartDataExcel, exportTableData, formatDateForExport } from '../utils/exportUtils'
import './CostShareDashboard.css'

const COSTSHARE_COLUMNS = [
  { key: 'fullName', label: 'Producer', render: 'donorLink', className: 'wrap-cell' },
  { key: 'farmName', label: 'Farm Name' },
  { key: 'totalFunding', label: 'Total Funding', format: 'currency', align: 'right' },
  { key: 'totalAcres', label: 'Total Acres', align: 'right' },
  { key: 'lastProjectYear', label: 'Last Project Year', align: 'right' },
  { key: 'totalN', label: 'N (lbs)', align: 'right', format: 'number' },
  { key: 'totalP', label: 'P (lbs)', align: 'right', format: 'number' },
  { key: 'totalS', label: 'S (lbs)', align: 'right', format: 'number' },
  { key: 'contractCount', label: 'Total Contracts', align: 'right' },
  { key: 'costShareUrl', label: 'History', render: 'historyLink' },
]

function BMPByYearTable({ rows }) {
  if (!rows || rows.length === 0) return null

  // Group by year, find top 3 BMPs per year
  const yearMap = {}
  rows.forEach((r) => {
    if (!r.projectYear || !r.bmp) return
    const y = r.projectYear
    if (!yearMap[y]) yearMap[y] = {}
    if (!yearMap[y][r.bmp]) yearMap[y][r.bmp] = { count: 0, acres: 0, funding: 0 }
    yearMap[y][r.bmp].count += 1
    yearMap[y][r.bmp].acres += r.practiceAcres
    yearMap[y][r.bmp].funding += r.totalAmount
  })

  const yearData = Object.keys(yearMap)
    .map(Number)
    .sort((a, b) => b - a)
    .map((year) => {
      const bmps = Object.entries(yearMap[year])
        .map(([bmp, stats]) => ({ bmp, ...stats }))
        .sort((a, b) => b.count - a.count)
      return { year, topBmps: bmps.slice(0, 3) }
    })

  return (
    <div className="bmp-totals">
      <div className="bmp-table-scroll">
        <table className="bmp-totals-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Top BMPs</th>
              <th className="text-right">Contracts</th>
              <th className="text-right">Acres</th>
              <th className="text-right">Funding</th>
            </tr>
          </thead>
          <tbody>
            {yearData.map((d) =>
              d.topBmps.map((bmp, j) => (
                <tr key={`${d.year}-${j}`} className={j === 0 ? 'bmp-year-first' : ''}>
                  {j === 0 && (
                    <td rowSpan={d.topBmps.length}><strong>{d.year}</strong></td>
                  )}
                  <td className="bmp-name-cell">
                    <span className="bmp-dot" style={{ background: CHART_COLORS[j % CHART_COLORS.length] }} />
                    {bmp.bmp}
                  </td>
                  <td className="text-right">{bmp.count}</td>
                  <td className="text-right">{formatNumber(Math.round(bmp.acres))}</td>
                  <td className="text-right">{formatCurrency(bmp.funding)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function CostShareDashboard() {
  const [filters, setFilters] = useState({
    yearStart: null,
    yearEnd: null,
    bmps: [],
    segments: [],
    streams: [],
  })
  const chartsRef = useRef(null)

  const {
    isLoading,
    error,
    metrics,
    fundingByYear,
    fundingSourceBreakdown,
    bmpDistribution,
    environmentalImpact,
    timeline,
    allFarms,
    insights,
    budgetBySegment,
    fundingBySource,
    budgetByBMPType,
    filterOptions,
    filteredRows,
    filteredRowCount,
    totalRowCount,
    mapData,
  } = useCostShareData(filters)

  const handleExportImage = useCallback(async () => {
    if (chartsRef.current) {
      await exportAsImage(chartsRef.current, 'costshare-dashboard')
    }
  }, [])

  const handleExportChartData = useCallback(() => {
    if (!metrics) return
    exportChartDataExcel({
      metrics,
      metricsTitle: 'Cost-Share Metrics',
      sheets: [
        { name: 'Funding by Year', data: fundingByYear.data },
        { name: 'Funding Source Breakdown', data: fundingSourceBreakdown },
        { name: 'BMP Distribution', data: bmpDistribution },
        { name: 'Environmental Impact', data: environmentalImpact.byBMP },
        { name: 'Timeline', data: timeline },
        { name: 'Budget by Segment', data: budgetBySegment },
        { name: 'Funding by Source', data: fundingBySource },
      ],
      filename: 'costshare-chart-data',
    })
  }, [metrics, fundingByYear, fundingSourceBreakdown, bmpDistribution, environmentalImpact, timeline, budgetBySegment, fundingBySource])

  const handleExportTableData = useCallback(() => {
    if (!filteredRows) return
    const exportRows = filteredRows.map((r) => ({
      'Person ID': r.personId,
      'Full Name': r.fullName,
      'Farm Name': r.farmName,
      'BMP': r.bmp,
      'Practice Date': formatDateForExport(r.practiceDate),
      'Practice Acres': r.practiceAcres,
      '319 Amount': r.odata319Amount,
      'Other Amount': r.otherAmount,
      'Local Amount': r.localAmount,
      'Total Amount': r.totalAmount,
      'N Reductions': r.nReductions,
      'P Reductions': r.pReductions,
      'S Reductions': r.sReductions,
      'Stream': r.stream,
      'Project Year': r.projectYear,
      'Segment': r.projectSegment,
      'Contract ID': r.contractId,
    }))
    exportTableData(exportRows, 'costshare-transactions')
  }, [filteredRows])

  const exportHandlers = {
    onExportImage: handleExportImage,
    onExportChartData: handleExportChartData,
    onExportTableData: handleExportTableData,
    tableDataLabel: 'Export Transaction Data (Excel)',
  }

  const costShareFilterFields = [
    { type: 'yearRange', key: ['yearStart', 'yearEnd'], label: 'Year Range', options: filterOptions.years },
    { type: 'multiSelect', key: 'segments', label: 'Segment', options: filterOptions.segments },
    { type: 'multiSelect', key: 'bmps', label: 'BMP', options: filterOptions.bmps },
    { type: 'multiSelect', key: 'streams', label: 'Stream', options: filterOptions.streams },
  ]
  const clearFilters = () => setFilters({ yearStart: null, yearEnd: null, bmps: [], segments: [], streams: [] })

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading cost-share data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="app-error">Error loading data: {error}</div>
  }

  const hasActiveFilters = filters.yearStart || filters.yearEnd
    || filters.bmps.length > 0 || filters.segments.length > 0 || filters.streams.length > 0

  if (!metrics && !hasActiveFilters) {
    return <div className="app-error">No cost-share data found.</div>
  }

  if (!metrics && hasActiveFilters) {
    return (
      <div className="costshare-dashboard">
        <div className="costshare-dashboard-header">
          <h1 className="costshare-dashboard-title">Cost-Share Dashboard</h1>
        </div>
        <FilterBar filters={filters} onFilterChange={setFilters} fields={costShareFilterFields} clearFilters={clearFilters} />
        <div className="app-error">
          No data found for the applied filters.
          <button className="filter-reset-btn" onClick={clearFilters}>Reset Filters</button>
        </div>
      </div>
    )
  }

  const isFiltered = filteredRowCount < totalRowCount

  const tableTitle = (() => {
    const parts = []
    if (filters.yearStart && filters.yearEnd) {
      parts.push(`${filters.yearStart}–${filters.yearEnd}`)
    } else if (filters.yearStart) {
      parts.push(`${filters.yearStart}+`)
    } else if (filters.yearEnd) {
      parts.push(`through ${filters.yearEnd}`)
    }
    if (filters.segments.length > 0) parts.push(`Seg ${filters.segments.join(', ')}`)
    if (filters.bmps.length > 0) parts.push(filters.bmps.join(', '))
    if (filters.streams.length > 0) parts.push(filters.streams.join(', '))
    return parts.length > 0 ? `All Farms — ${parts.join(' · ')}` : 'All Farms'
  })()

  return (
    <div className="costshare-dashboard">
      <div className="costshare-dashboard-header">
        <h1 className="costshare-dashboard-title">Cost-Share Dashboard</h1>
        {isFiltered && (
          <span className="costshare-dashboard-filter-badge">
            Showing {filteredRowCount.toLocaleString()} of {totalRowCount.toLocaleString()} records
          </span>
        )}
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} fields={costShareFilterFields} clearFilters={clearFilters} exportHandlers={exportHandlers} />

      {/* Capture area for image export (excludes map and table) */}
      <div ref={chartsRef} className="export-capture-area">
        {/* Key Metrics */}
        <div className="costshare-metrics-row">
          <MetricCard label="Total Farms" value={formatNumber(metrics.totalFarms)} subtitle={`${metrics.totalProducers} producers`} />
          <MetricCard label="Total Funding" value={formatCurrency(metrics.totalFunding)} subtitle={`${metrics.contractCount} contracts`} />
          <MetricCard label="Acres Impacted" value={formatNumber(metrics.totalAcres)} />
          <MetricCard label="N Reduction" value={`${formatNumber(metrics.nitrogenReduction)} lbs`} />
          <MetricCard label="P Reduction" value={`${formatNumber(metrics.phosphorusReduction)} lbs`} />
          <MetricCard label="S Reduction" value={`${formatNumber(metrics.sedimentReduction)} lbs`} />
        </div>

        {/* Key Highlights */}
        <BentoGrid>
          <BentoCard colSpan={4}>
            <InsightsCard insights={insights} />
          </BentoCard>
        </BentoGrid>
      </div>{/* end capture area */}

      {/* Map + Timeline (outside capture area — Leaflet tiles don't export via html2canvas) */}
      <BentoGrid>
        <BentoCard title="Farm Locations" colSpan={2}>
          <CostShareMap data={mapData} />
        </BentoCard>

        <BentoCard title="Contracts & Acres Over Time" colSpan={2}>
          <DualAxisTimelineChart
            data={timeline}
            leftKey="contractCount"
            leftLabel="Contracts"
            leftColor="#4CA5C2"
            rightKey="totalAcres"
            rightLabel="Acres"
            rightColor="#9370DB"
          />
        </BentoCard>
      </BentoGrid>

      {/* Charts Section 1: Cost-Share History */}
      <BentoGrid>
        <BentoCard title="Top BMPs by Year">
          <BMPByYearTable rows={filteredRows} />
        </BentoCard>

        <BentoCard title="BMP Distribution" colSpan={3}>
          <BMPDistributionChart data={bmpDistribution} />
        </BentoCard>

        <BentoCard title="Environmental Impact by Practice" colSpan={4}>
          <EnvironmentalImpactChart data={environmentalImpact} />
        </BentoCard>
      </BentoGrid>

      {/* Funding Analysis Section */}
      <h2 className="costshare-section-header">Funding Analysis & Budget Tracking</h2>
      <BentoGrid>
        <BentoCard title="Funding Over Time" colSpan={3}>
          <FundingOverTimeChart data={fundingByYear.data} />
        </BentoCard>

        <BentoCard title="Funding Source Breakdown">
          <MembershipStatusChart data={fundingSourceBreakdown} tooltipLabel="funding" valueFormatter={formatCurrency} />
        </BentoCard>

        {budgetBySegment.length > 0 && (
          <>
            <BentoCard title="Budget Overview by Segment" colSpan={2}>
              <BudgetOverviewChart data={budgetBySegment} />
            </BentoCard>

            <BentoCard title="Funding by Source" colSpan={2}>
              <FundingBySourceChart data={fundingBySource} />
            </BentoCard>

            <BentoCard title="Budget Utilization by Practice Type" colSpan={4}>
              <FundingBySourceChart data={budgetByBMPType} />
            </BentoCard>
          </>
        )}
      </BentoGrid>

      {/* Data Table */}
      <BentoGrid>
        <BentoCard title={tableTitle} colSpan={4}>
          <DataTable
            data={allFarms}
            columns={COSTSHARE_COLUMNS}
            searchPlaceholder="Search farms..."
            breakdownKey="bmpBreakdown"
          />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
