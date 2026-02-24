import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import {
  aggregateVendorCategory,
  computeVendorMetrics,
  computeSpendingByYear,
  computePaymentTypeBreakdown,
  computeCategoryByYear,
  computeTransactionVolumeByType,
  computeTransactionVolumeByCategory,
  computeAllVendors,
  computeVendorInsights,
  getUniquePaymentTypes,
  getUniqueVendorYears,
  getUniqueCategories,
} from '../utils/vendorAggregations'

export default function useVendorData(filters = {}) {
  const { data, isLoading, error } = useData()

  const rawRows = data?.vendorHistory || []

  const filterOptions = useMemo(() => ({
    paymentTypes: getUniquePaymentTypes(rawRows),
    years: getUniqueVendorYears(rawRows),
    categories: getUniqueCategories(rawRows),
  }), [rawRows])

  const yearFilteredRows = useMemo(() => {
    let rows = rawRows
    if (filters.yearStart) {
      rows = rows.filter((r) => r.paymentYear >= filters.yearStart)
    }
    if (filters.yearEnd) {
      rows = rows.filter((r) => r.paymentYear <= filters.yearEnd)
    }
    return rows
  }, [rawRows, filters.yearStart, filters.yearEnd])

  const filteredRows = useMemo(() => {
    let rows = yearFilteredRows
    if (filters.paymentTypes && filters.paymentTypes.length > 0) {
      rows = rows.filter((r) => filters.paymentTypes.includes(r.paymentType))
    }
    if (filters.categories && filters.categories.length > 0) {
      rows = rows.filter((r) => filters.categories.includes(aggregateVendorCategory(r.splitNote, r.memo, r.fullName)))
    }
    return rows
  }, [yearFilteredRows, filters.paymentTypes, filters.categories])

  const metrics = useMemo(() => computeVendorMetrics(filteredRows), [filteredRows])
  const spendingByYear = useMemo(() => computeSpendingByYear(filteredRows), [filteredRows])
  const paymentTypeBreakdown = useMemo(() => computePaymentTypeBreakdown(filteredRows), [filteredRows])
  const categoryByYear = useMemo(() => computeCategoryByYear(filteredRows), [filteredRows])
  const transactionVolume = useMemo(() => computeTransactionVolumeByType(filteredRows), [filteredRows])
  const categoryVolume = useMemo(() => computeTransactionVolumeByCategory(filteredRows), [filteredRows])
  const allVendors = useMemo(() => computeAllVendors(filteredRows), [filteredRows])
  const insights = useMemo(
    () => metrics ? computeVendorInsights(metrics, spendingByYear.data, paymentTypeBreakdown, filteredRows) : [],
    [metrics, spendingByYear, paymentTypeBreakdown, filteredRows]
  )

  return {
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
    filteredRowCount: filteredRows.length,
    totalRowCount: rawRows.length,
  }
}
