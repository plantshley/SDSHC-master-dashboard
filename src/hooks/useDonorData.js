import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import {
  computeDonorMetrics,
  computeGivingByYear,
  computeMembershipStatus,
  computeGiftTypeByYear,
  computeTransactionVolume,
  computeTopDonors,
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

  // Apply filters
  const filteredRows = useMemo(() => {
    let rows = rawRows

    if (filters.yearStart) {
      rows = rows.filter((r) => r.giftYear >= filters.yearStart)
    }
    if (filters.yearEnd) {
      rows = rows.filter((r) => r.giftYear <= filters.yearEnd)
    }
    if (filters.giftTypes && filters.giftTypes.length > 0) {
      rows = rows.filter((r) => filters.giftTypes.includes(r.giftType))
    }
    if (filters.membershipStatuses && filters.membershipStatuses.length > 0) {
      rows = rows.filter((r) => filters.membershipStatuses.includes(r.membershipStatus))
    }

    return rows
  }, [rawRows, filters.yearStart, filters.yearEnd, filters.giftTypes, filters.membershipStatuses])

  // Compute all aggregations
  const metrics = useMemo(() => computeDonorMetrics(filteredRows), [filteredRows])
  const givingByYear = useMemo(() => computeGivingByYear(filteredRows), [filteredRows])
  const membershipStatus = useMemo(() => computeMembershipStatus(filteredRows), [filteredRows])
  const giftTypeByYear = useMemo(() => computeGiftTypeByYear(filteredRows), [filteredRows])
  const transactionVolume = useMemo(() => computeTransactionVolume(filteredRows), [filteredRows])
  const topDonors = useMemo(() => computeTopDonors(filteredRows), [filteredRows])
  const insights = useMemo(
    () => metrics ? computeInsights(metrics, givingByYear, membershipStatus, filteredRows) : [],
    [metrics, givingByYear, membershipStatus, filteredRows]
  )

  return {
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
    filteredRowCount: filteredRows.length,
    totalRowCount: rawRows.length,
  }
}
