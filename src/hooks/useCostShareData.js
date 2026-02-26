import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import {
  computeCostShareMetrics,
  computeFundingByYear,
  computeFundingSourceBreakdown,
  computeBMPDistribution,
  computeEnvironmentalImpact,
  computeTimeline,
  computeAllFarms,
  computeCostShareInsights,
  getUniqueProjectYears,
  getUniqueBMPs,
  getUniqueSegments,
  getUniqueStreams,
} from '../utils/costShareAggregations'
import {
  computeBudgetBySegment,
  computeFundingBySource,
  computeBudgetByBMPType,
} from '../utils/fundingAggregations'

export default function useCostShareData(filters = {}) {
  const { data, isLoading, error } = useData()

  const rawRows = data?.costShareHistory || []
  const fundingCSV = data?.costShareFunding || []

  // Available filter options (from unfiltered data)
  const filterOptions = useMemo(() => ({
    years: getUniqueProjectYears(rawRows),
    bmps: getUniqueBMPs(rawRows),
    segments: getUniqueSegments(rawRows),
    streams: getUniqueStreams(rawRows),
  }), [rawRows])

  // Year-only filtered rows
  const yearFilteredRows = useMemo(() => {
    let rows = rawRows
    if (filters.yearStart) {
      rows = rows.filter((r) => r.projectYear >= filters.yearStart)
    }
    if (filters.yearEnd) {
      rows = rows.filter((r) => r.projectYear <= filters.yearEnd)
    }
    return rows
  }, [rawRows, filters.yearStart, filters.yearEnd])

  // Apply all filters
  const filteredRows = useMemo(() => {
    let rows = yearFilteredRows
    if (filters.bmps && filters.bmps.length > 0) {
      rows = rows.filter((r) => filters.bmps.includes(r.bmp))
    }
    if (filters.segments && filters.segments.length > 0) {
      rows = rows.filter((r) => filters.segments.includes(r.projectSegment))
    }
    if (filters.streams && filters.streams.length > 0) {
      rows = rows.filter((r) => filters.streams.includes(r.stream))
    }
    return rows
  }, [yearFilteredRows, filters.bmps, filters.segments, filters.streams])

  // Compute all aggregations
  const metrics = useMemo(() => computeCostShareMetrics(filteredRows), [filteredRows])
  const fundingByYear = useMemo(() => computeFundingByYear(filteredRows), [filteredRows])
  const fundingSourceBreakdown = useMemo(() => computeFundingSourceBreakdown(filteredRows), [filteredRows])
  const bmpDistribution = useMemo(() => computeBMPDistribution(filteredRows), [filteredRows])
  const environmentalImpact = useMemo(() => computeEnvironmentalImpact(filteredRows), [filteredRows])
  const timeline = useMemo(() => computeTimeline(filteredRows), [filteredRows])
  const allFarms = useMemo(() => computeAllFarms(filteredRows), [filteredRows])
  const insights = useMemo(
    () => metrics ? computeCostShareInsights(metrics, fundingByYear.data, bmpDistribution, filteredRows) : [],
    [metrics, fundingByYear, bmpDistribution, filteredRows]
  )

  // Funding CSV aggregations (not affected by cost-share history filters)
  const budgetBySegment = useMemo(() => computeBudgetBySegment(fundingCSV), [fundingCSV])
  const fundingBySource = useMemo(() => computeFundingBySource(fundingCSV), [fundingCSV])
  const budgetByBMPType = useMemo(() => computeBudgetByBMPType(fundingCSV), [fundingCSV])

  // Map data — only rows with valid coordinates in SD bounding box
  const mapData = useMemo(() => {
    return filteredRows.filter((r) =>
      r.lat && r.longitude &&
      r.lat >= 42.5 && r.lat <= 46.0 &&
      r.longitude >= -104.5 && r.longitude <= -96.0
    )
  }, [filteredRows])

  return {
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
    filteredRowCount: filteredRows.length,
    totalRowCount: rawRows.length,
    mapData,
  }
}
