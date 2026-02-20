import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import {
  computeDonorMetrics,
  computeGivingByYear,
  computeMembershipStatus,
  computeGiftTypeByYear,
  computeTransactionVolume,
  computeAllDonors,
  computeInsights,
  getUniqueGiftTypes,
  getUniqueYears,
  getUniqueMembershipStatuses,
} from '../utils/donorAggregations'

export default function useDonorData(filters = {}) {
  const { data, isLoading, error } = useData()

  const rawRows = data?.donorHistory || []

  // Available filter options (computed from unfiltered data)
  const filterOptions = useMemo(() => ({
    giftTypes: getUniqueGiftTypes(rawRows),
    years: getUniqueYears(rawRows),
    membershipStatuses: getUniqueMembershipStatuses(rawRows),
  }), [rawRows])

  // Year-only filtered rows (for membership count — ignores gift type and status filters)
  const yearFilteredRows = useMemo(() => {
    let rows = rawRows
    if (filters.yearStart) {
      rows = rows.filter((r) => r.giftYear >= filters.yearStart)
    }
    if (filters.yearEnd) {
      rows = rows.filter((r) => r.giftYear <= filters.yearEnd)
    }
    return rows
  }, [rawRows, filters.yearStart, filters.yearEnd])

  // Apply all filters
  const filteredRows = useMemo(() => {
    let rows = yearFilteredRows
    if (filters.giftTypes && filters.giftTypes.length > 0) {
      rows = rows.filter((r) => filters.giftTypes.includes(r.giftType))
    }
    if (filters.membershipStatuses && filters.membershipStatuses.length > 0) {
      rows = rows.filter((r) => filters.membershipStatuses.includes(r.membershipStatus))
    }
    return rows
  }, [yearFilteredRows, filters.giftTypes, filters.membershipStatuses])

  // Compute all aggregations
  const metrics = useMemo(() => computeDonorMetrics(filteredRows), [filteredRows])
  const givingByYear = useMemo(() => computeGivingByYear(filteredRows), [filteredRows])
  const membershipStatus = useMemo(() => computeMembershipStatus(filteredRows), [filteredRows])
  const giftTypeByYear = useMemo(() => computeGiftTypeByYear(filteredRows), [filteredRows])
  const transactionVolume = useMemo(() => computeTransactionVolume(filteredRows), [filteredRows])
  const allDonors = useMemo(() => computeAllDonors(filteredRows), [filteredRows])
  const insights = useMemo(
    () => metrics ? computeInsights(metrics, givingByYear.data, membershipStatus, filteredRows) : [],
    [metrics, givingByYear, membershipStatus, filteredRows]
  )

  // Membership count from year-filtered (unfiltered by type/status) + giving from fully filtered
  const membershipByYear = useMemo(() => {
    const unfilteredByYear = computeGivingByYear(yearFilteredRows)
    const filteredByYear = givingByYear

    // Build merged data: membership counts from unfiltered, giving from filtered
    const yearSet = new Set([
      ...unfilteredByYear.data.map((d) => d.year),
      ...filteredByYear.data.map((d) => d.year),
    ])
    const filteredMap = {}
    filteredByYear.data.forEach((d) => { filteredMap[d.year] = d })
    const unfilteredMap = {}
    unfilteredByYear.data.forEach((d) => { unfilteredMap[d.year] = d })

    return Array.from(yearSet).sort().map((year) => ({
      year,
      membershipCount: unfilteredMap[year]?.membershipCount || 0,
      totalGiving: filteredMap[year]?.totalGiving || 0,
    }))
  }, [yearFilteredRows, givingByYear])

  return {
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
    filteredRowCount: filteredRows.length,
    totalRowCount: rawRows.length,
    membershipByYear,
  }
}
