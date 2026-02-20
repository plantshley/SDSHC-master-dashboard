import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import {
  computeMasterMetrics,
  computeRelationshipBreakdown,
  computeMembershipBreakdown,
  computeStateDistribution,
  computeEngagementMatrix,
  computeFinancialSummaryByRole,
  computeMasterInsights,
  getFilterOptions,
} from '../utils/masterAggregations'

function matchesRole(relationship, role) {
  if (!relationship) return false
  return relationship.toLowerCase().includes(role.toLowerCase())
}

export default function useMasterData(filters = {}) {
  const { data, isLoading, error } = useData()

  const rawRows = data?.masterDatabase || []

  const filterOptions = useMemo(() => getFilterOptions(rawRows), [rawRows])

  const filteredRows = useMemo(() => {
    let rows = rawRows
    if (filters.relationships && filters.relationships.length > 0) {
      rows = rows.filter((r) =>
        filters.relationships.some((role) => matchesRole(r.relationship, role))
      )
    }
    if (filters.membershipStatuses && filters.membershipStatuses.length > 0) {
      rows = rows.filter((r) => filters.membershipStatuses.includes(r.membershipStatus))
    }
    if (filters.states && filters.states.length > 0) {
      rows = rows.filter((r) => filters.states.includes(r.state))
    }
    if (filters.newsletterStatuses && filters.newsletterStatuses.length > 0) {
      rows = rows.filter((r) => filters.newsletterStatuses.includes(r.newsletterStatus))
    }
    return rows
  }, [rawRows, filters.relationships, filters.membershipStatuses, filters.states, filters.newsletterStatuses])

  const metrics = useMemo(() => computeMasterMetrics(filteredRows), [filteredRows])
  const relationshipBreakdown = useMemo(() => computeRelationshipBreakdown(filteredRows), [filteredRows])
  const membershipBreakdown = useMemo(() => computeMembershipBreakdown(filteredRows), [filteredRows])
  const stateDistribution = useMemo(() => computeStateDistribution(filteredRows), [filteredRows])
  const engagementMatrix = useMemo(() => computeEngagementMatrix(filteredRows), [filteredRows])
  const financialSummary = useMemo(() => computeFinancialSummaryByRole(filteredRows), [filteredRows])
  const insights = useMemo(
    () => metrics ? computeMasterInsights(metrics, filteredRows) : [],
    [metrics, filteredRows]
  )

  return {
    isLoading,
    error,
    metrics,
    relationshipBreakdown,
    membershipBreakdown,
    stateDistribution,
    engagementMatrix,
    financialSummary,
    allPeople: filteredRows,
    insights,
    filterOptions,
    filteredCount: filteredRows.length,
    totalCount: rawRows.length,
  }
}
