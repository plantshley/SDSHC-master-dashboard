import { useState, useRef, useCallback } from 'react'
import { usePersistedFilters } from '../context/FilterContext'
import useMasterData from '../hooks/useMasterData'
import { formatCurrency, formatNumber } from '../utils/formatters'
import { exportAsImage, exportChartDataExcel, exportTableData, formatDateForExport } from '../utils/exportUtils'
import BentoGrid from '../components/BentoGrid/BentoGrid'
import BentoCard from '../components/BentoCard/BentoCard'
import MetricCard from '../components/MetricCard/MetricCard'
import FilterBar from '../components/FilterBar/FilterBar'
import MembershipStatusChart from '../components/charts/MembershipStatusChart'
import RelationshipTreemap from '../components/charts/RelationshipTreemap'
import StateDistributionChart from '../components/charts/StateDistributionChart'
import EngagementMatrixChart from '../components/charts/EngagementMatrixChart'
import FinancialByRoleChart from '../components/charts/FinancialByRoleChart'
import DataTable from '../components/DataTable/DataTable'
import InsightsCard from '../components/InsightsCard/InsightsCard'
import ProfileModal from '../components/ProfileModal/ProfileModal'
import './MasterDashboard.css'

const MASTER_COLUMNS = [
  { key: 'fullName', label: 'Name', className: 'wrap-cell' },
  { key: 'relationship', label: 'Relationship', className: 'wrap-cell' },
  { key: 'membershipStatus', label: 'Member Status' },
  { key: 'lastTransactionYear', label: 'Last Transaction', align: 'right' },
  { key: 'recordUrl', label: 'View/Edit', render: 'externalLink' },
  { key: 'donorUrl', label: 'Donor History', render: 'historyLink', showIf: 'hasDonorHistory' },
  { key: 'vendorUrl', label: 'Vendor History', render: 'historyLink', showIf: 'hasVendorHistory' },
  { key: 'costShareUrl', label: 'Cost-share History', render: 'historyLink', showIf: 'hasCostShareHistory' },
]

const EMPTY_FILTERS = {
  relationships: [],
  membershipStatuses: [],
  states: [],
  newsletterStatuses: [],
}

export default function MasterDashboard() {
  const [filters, setFilters] = usePersistedFilters('master', EMPTY_FILTERS)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const chartsRef = useRef(null)

  const {
    isLoading,
    error,
    metrics,
    relationshipBreakdown,
    membershipBreakdown,
    stateDistribution,
    engagementMatrix,
    financialSummary,
    allPeople,
    insights,
    filterOptions,
    filteredCount,
    totalCount,
  } = useMasterData(filters)

  const handleExportImage = useCallback(async () => {
    if (chartsRef.current) {
      await exportAsImage(chartsRef.current, 'master-dashboard')
    }
  }, [])

  const handleExportChartData = useCallback(() => {
    if (!metrics) return
    exportChartDataExcel({
      metrics,
      metricsTitle: 'Master Metrics',
      sheets: [
        { name: 'Relationship Breakdown', data: relationshipBreakdown },
        { name: 'Membership Breakdown', data: membershipBreakdown },
        { name: 'State Distribution', data: stateDistribution },
        { name: 'Engagement Matrix', data: engagementMatrix },
        { name: 'Financial Summary', data: financialSummary },
      ],
      filename: 'master-chart-data',
    })
  }, [metrics, relationshipBreakdown, membershipBreakdown, stateDistribution, engagementMatrix, financialSummary])

  const handleExportTableData = useCallback(() => {
    if (!allPeople) return
    const exportRows = allPeople.map((r) => ({
      'ID': r.id,
      'Person ID': r.personId,
      'Full Name': r.fullName,
      'First Name': r.firstName,
      'Last Name': r.lastName,
      'Relationship': r.relationship,
      'Membership Status': r.membershipStatus,
      'Last Membership Year': r.lastMembershipYear,
      'Last Transaction Year': r.lastTransactionYear,
      'Lifetime Giving': r.lifetimeGiftAmount,
      'Lifetime Vending': r.lifetimeVendingTotal,
      'Lifetime Cost-share': r.lifetimeCostshareTotal,
      'Last Gift Date': formatDateForExport(r.lastGiftDate),
      'Last Gift Year': r.lastGiftYear,
      'Last Gift Amount': r.lastGiftAmount,
      'Last Gift Type': r.lastGiftType,
      'Thank You Sent': r.thankYouSent,
      'Email': r.email,
      'Phone': r.phone,
      'Primary Address': r.primaryAddress,
      'Street': r.street,
      'Street II': r.streetII,
      'City': r.city,
      'State': r.state,
      'Zipcode': r.zipcode,
      'Contact Preference': r.contactPreference,
      'Newsletter Status': r.newsletterStatus,
      'Modified': formatDateForExport(r.modified),
      'Has Donor History': r.hasDonorHistory,
      'Has Vendor History': r.hasVendorHistory,
      'Has Cost-share History': r.hasCostShareHistory,
      'Record URL': r.recordUrl,
      'Donor URL': r.donorUrl,
      'Vendor URL': r.vendorUrl,
      'Cost-share URL': r.costShareUrl,
    }))
    exportTableData(exportRows, 'master-database')
  }, [allPeople])

  const exportHandlers = {
    onExportImage: handleExportImage,
    onExportChartData: handleExportChartData,
    onExportTableData: handleExportTableData,
    tableDataLabel: 'Export Table Data (Excel)',
  }

  const masterFilterFields = [
    { type: 'multiSelect', key: 'relationships', label: 'Relationship', options: filterOptions.relationships },
    { type: 'multiSelect', key: 'membershipStatuses', label: 'Member Status', options: filterOptions.membershipStatuses },
    { type: 'multiSelect', key: 'states', label: 'State', options: filterOptions.states },
    { type: 'multiSelect', key: 'newsletterStatuses', label: 'Newsletter', options: filterOptions.newsletterStatuses },
  ]
  const clearFilters = () => setFilters(EMPTY_FILTERS)

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading master data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="app-error">Error loading data: {error}</div>
  }

  const hasActiveFilters = filters.relationships.length > 0
    || filters.membershipStatuses.length > 0
    || filters.states.length > 0
    || filters.newsletterStatuses.length > 0

  if (!metrics && !hasActiveFilters) {
    return <div className="app-error">No master data found.</div>
  }

  if (!metrics && hasActiveFilters) {
    return (
      <div className="master-dashboard">
        <div className="master-dashboard-header">
          <h1 className="master-dashboard-title">Master Peoples / Entities Dashboard</h1>
        </div>
        <FilterBar filters={filters} onFilterChange={setFilters} fields={masterFilterFields} clearFilters={clearFilters} />
        <div className="app-error">
          No data found for the applied filters.
          <button className="filter-reset-btn" onClick={clearFilters}>Reset Filters</button>
        </div>
      </div>
    )
  }

  const isFiltered = filteredCount < totalCount

  const tableTitle = (() => {
    const parts = []
    if (filters.relationships.length > 0) parts.push(filters.relationships.join(', '))
    if (filters.membershipStatuses.length > 0) parts.push(filters.membershipStatuses.join(', '))
    if (filters.states.length > 0) parts.push(filters.states.join(', '))
    if (filters.newsletterStatuses.length > 0) parts.push(filters.newsletterStatuses.join(', '))
    return parts.length > 0
      ? `All Peoples/Entities — ${parts.join(' · ')}`
      : 'All Peoples/Entities'
  })()

  return (
    <div className="master-dashboard">
      <div className="master-dashboard-header">
        <h1 className="master-dashboard-title">Master Peoples / Entities Dashboard</h1>
        {isFiltered && (
          <span className="master-dashboard-filter-badge">
            Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} records
          </span>
        )}
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} fields={masterFilterFields} clearFilters={clearFilters} exportHandlers={exportHandlers} />

      {/* Capture area for image export */}
      <div ref={chartsRef} className="export-capture-area">
      {/* Key Metrics */}
      <div className="master-metrics-row">
        <MetricCard label="Total People" value={formatNumber(metrics.totalPeople)} />
        <MetricCard label="Donors" value={formatNumber(metrics.totalDonors)} />
        <MetricCard label="Vendors" value={formatNumber(metrics.totalVendors)} />
        <MetricCard label="Cost-share" value={formatNumber(metrics.totalCostShare)} />
        <MetricCard label="Active Members" value={formatNumber(metrics.activeMembers)} />
        <MetricCard label="Lifetime Giving" value={formatCurrency(metrics.totalLifetimeGiving)} />
      </div>

      {/* Insights */}
      <BentoGrid>
        <BentoCard colSpan={4}>
          <InsightsCard insights={insights} />
        </BentoCard>
      </BentoGrid>

      {/* Charts */}
      <BentoGrid>
        <BentoCard title="Relationship Breakdown" colSpan={2}>
          <RelationshipTreemap data={relationshipBreakdown} />
        </BentoCard>

        <BentoCard title="Financial Summary by Role" colSpan={2}>
          <FinancialByRoleChart data={financialSummary} />
        </BentoCard>

        <BentoCard title="Membership Status">
          <MembershipStatusChart data={membershipBreakdown} />
        </BentoCard>

        <BentoCard title="Engagement by Role & Status" colSpan={2}>
          <EngagementMatrixChart data={engagementMatrix} />
        </BentoCard>

        <BentoCard title="Geographic Distribution">
          <StateDistributionChart data={stateDistribution} />
        </BentoCard>
      </BentoGrid>
      </div>{/* end capture area */}

      <BentoGrid>
        <BentoCard title={tableTitle} colSpan={4}>
          <DataTable
            data={allPeople}
            columns={MASTER_COLUMNS}
            onRowClick={setSelectedPerson}
            searchPlaceholder="Search peoples/entities..."
          />
        </BentoCard>
      </BentoGrid>

      {selectedPerson && (
        <ProfileModal
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  )
}
