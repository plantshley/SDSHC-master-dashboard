import { useState } from 'react'
import useDonorData from '../hooks/useDonorData'
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters'
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

const TOP_DONOR_COLUMNS = [
  { key: 'fullName', label: 'Donor Name' },
  { key: 'membershipStatus', label: 'Status' },
  { key: 'totalGiven', label: 'Total Given', format: 'currency', align: 'right' },
  { key: 'transactionCount', label: 'Transactions', align: 'right' },
  { key: 'lastGiftYear', label: 'Last Gift Year', align: 'right' },
]

export default function DonorDashboard() {
  const [filters, setFilters] = useState({
    yearStart: null,
    yearEnd: null,
    giftTypes: [],
    membershipStatuses: [],
  })

  const {
    isLoading,
    error,
    metrics,
    givingByYear,
    membershipStatus,
    giftTypeByYear,
    transactionVolume,
    topDonors,
    insights,
    filterOptions,
    filteredRowCount,
    totalRowCount,
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

  if (!metrics) {
    return <div className="app-error">No donor data found.</div>
  }

  const isFiltered = filteredRowCount < totalRowCount

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
          value={metrics.yoyGrowth !== null ? formatPercent(metrics.yoyGrowth) : 'N/A'}
          trend={metrics.yoyGrowth}
        />
      </div>

      {/* Charts */}
      <BentoGrid>
        <BentoCard title="Membership & Total Giving Over Time" colSpan={3}>
          <GivingOverTimeChart data={givingByYear} />
        </BentoCard>

        <BentoCard title="Membership Status Breakdown">
          <MembershipStatusChart data={membershipStatus} />
        </BentoCard>

        <BentoCard title="Gift Type Dollar Breakdown by Year" colSpan={3}>
          <GiftTypeByYearChart
            data={giftTypeByYear.data}
            giftTypes={giftTypeByYear.giftTypes}
          />
        </BentoCard>

        <BentoCard title="Key Highlights & Insights">
          <InsightsCard insights={insights} />
        </BentoCard>

        <BentoCard title="Transaction Volume by Gift Type Over Time" colSpan={2}>
          <TransactionVolumeChart
            data={transactionVolume.data}
            giftTypes={transactionVolume.giftTypes}
          />
        </BentoCard>

        <BentoCard title="Membership Count & Total Giving by Year" colSpan={2}>
          <MembershipGivingDualAxis data={givingByYear} />
        </BentoCard>

        <BentoCard title="Top Donors by Total Giving" colSpan={4}>
          <DataTable data={topDonors} columns={TOP_DONOR_COLUMNS} />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}
