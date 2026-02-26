function formatInsightCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

function formatInsightNumber(val) {
  return new Intl.NumberFormat('en-US').format(Math.round(val))
}

export function computeCostShareMetrics(rows) {
  if (!rows || rows.length === 0) return null

  const uniqueFarms = new Set(rows.map((r) => r.farmName).filter(Boolean))
  const uniqueProducers = new Set(rows.map((r) => r.personId).filter(Boolean))
  const contractIds = new Set(rows.map((r) => r.contractId).filter(Boolean))
  const totalFunding = rows.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalAcres = rows.reduce((sum, r) => sum + r.practiceAcres, 0)
  const nitrogenReduction = rows.reduce((sum, r) => sum + r.nCombined, 0)
  const phosphorusReduction = rows.reduce((sum, r) => sum + r.pCombined, 0)
  const sedimentReduction = rows.reduce((sum, r) => sum + r.sCombined, 0)

  // Funding by year for peak/YoY
  const yearMap = {}
  rows.forEach((r) => {
    if (!r.projectYear) return
    if (!yearMap[r.projectYear]) yearMap[r.projectYear] = { total: 0, count: 0 }
    yearMap[r.projectYear].total += r.totalAmount
    yearMap[r.projectYear].count += 1
  })

  const years = Object.keys(yearMap).map(Number).sort()
  const peakFundingYear = years.reduce(
    (best, y) => (yearMap[y].total > (yearMap[best]?.total || 0) ? y : best),
    years[0]
  )

  const completeYears = years.filter((y) => y < new Date().getFullYear())
  let yoyGrowth = null
  if (completeYears.length >= 2) {
    const last = completeYears[completeYears.length - 1]
    const prev = completeYears[completeYears.length - 2]
    if (yearMap[prev].total > 0) {
      yoyGrowth = ((yearMap[last].total - yearMap[prev].total) / yearMap[prev].total) * 100
    }
  }
  const yoyYears = completeYears.length >= 2
    ? `${completeYears[completeYears.length - 2]}→${completeYears[completeYears.length - 1]}`
    : null

  return {
    totalFarms: uniqueFarms.size,
    totalProducers: uniqueProducers.size,
    totalFunding,
    contractCount: contractIds.size,
    totalAcres,
    nitrogenReduction,
    phosphorusReduction,
    sedimentReduction,
    peakFundingYear,
    yoyGrowth,
    yoyYears,
    dataYearRange: years.length > 0 ? `${years[0]} – ${years[years.length - 1]}` : '',
  }
}

export function computeFundingByYear(rows) {
  const yearMap = {}

  rows.forEach((r) => {
    if (!r.projectYear) return
    const y = r.projectYear
    if (!yearMap[y]) {
      yearMap[y] = { year: y, total319: 0, totalOther: 0, totalLocal: 0, totalFunding: 0 }
    }
    yearMap[y].total319 += r.odata319Amount
    yearMap[y].totalOther += r.otherAmount
    yearMap[y].totalLocal += r.localAmount
    yearMap[y].totalFunding += r.totalAmount
  })

  const data = Object.values(yearMap).sort((a, b) => a.year - b.year)
  return { data, fundingSources: ['total319', 'totalOther', 'totalLocal'] }
}

export function computeFundingSourceBreakdown(rows) {
  const total319 = rows.reduce((sum, r) => sum + r.odata319Amount, 0)
  const totalOther = rows.reduce((sum, r) => sum + r.otherAmount, 0)
  const totalLocal = rows.reduce((sum, r) => sum + r.localAmount, 0)
  const grandTotal = total319 + totalOther + totalLocal

  const sources = [
    { status: '319 Funds', count: total319, percentage: grandTotal > 0 ? (total319 / grandTotal) * 100 : 0 },
    { status: 'Other', count: totalOther, percentage: grandTotal > 0 ? (totalOther / grandTotal) * 100 : 0 },
    { status: 'Local', count: totalLocal, percentage: grandTotal > 0 ? (totalLocal / grandTotal) * 100 : 0 },
  ].filter((s) => s.count > 0)

  return sources.sort((a, b) => b.count - a.count)
}

export function computeBMPDistribution(rows) {
  const bmpMap = {}

  rows.forEach((r) => {
    if (!r.bmp) return
    if (!bmpMap[r.bmp]) {
      bmpMap[r.bmp] = { bmp: r.bmp, count: 0, totalAcres: 0, totalFunding: 0 }
    }
    bmpMap[r.bmp].count += 1
    bmpMap[r.bmp].totalAcres += r.practiceAcres
    bmpMap[r.bmp].totalFunding += r.totalAmount
  })

  return Object.values(bmpMap).sort((a, b) => b.count - a.count)
}

export function computeEnvironmentalImpact(rows) {
  // Combined totals (synergistic)
  const totals = {
    nitrogen: rows.reduce((s, r) => s + r.nReductions, 0),
    phosphorus: rows.reduce((s, r) => s + r.pReductions, 0),
    sediment: rows.reduce((s, r) => s + r.sReductions, 0),
    nCombined: rows.reduce((s, r) => s + r.nCombined, 0),
    pCombined: rows.reduce((s, r) => s + r.pCombined, 0),
    sCombined: rows.reduce((s, r) => s + r.sCombined, 0),
  }

  // By BMP - top by nitrogen combined
  const bmpMap = {}
  rows.forEach((r) => {
    if (!r.bmp) return
    if (!bmpMap[r.bmp]) {
      bmpMap[r.bmp] = { bmp: r.bmp, nitrogen: 0, phosphorus: 0, sediment: 0 }
    }
    bmpMap[r.bmp].nitrogen += r.nCombined
    bmpMap[r.bmp].phosphorus += r.pCombined
    bmpMap[r.bmp].sediment += r.sCombined
  })

  const byBMP = Object.values(bmpMap)
    .sort((a, b) => b.nitrogen - a.nitrogen)
    .slice(0, 8)

  return { totals, byBMP }
}

export function computeTimeline(rows) {
  const yearMap = {}

  rows.forEach((r) => {
    if (!r.projectYear) return
    const y = r.projectYear
    if (!yearMap[y]) {
      yearMap[y] = { year: y, contractCount: 0, totalAcres: 0, contracts: new Set() }
    }
    if (r.contractId) yearMap[y].contracts.add(r.contractId)
    yearMap[y].totalAcres += r.practiceAcres
  })

  return Object.values(yearMap)
    .map((d) => ({
      year: d.year,
      contractCount: d.contracts.size,
      totalAcres: Math.round(d.totalAcres),
    }))
    .sort((a, b) => a.year - b.year)
}

export function computeAllFarms(rows) {
  const farmMap = {}

  rows.forEach((r) => {
    if (!r.personId) return
    if (!farmMap[r.personId]) {
      farmMap[r.personId] = {
        personId: r.personId,
        fullName: r.fullName || 'Unknown',
        farmName: r.farmName || '',
        totalFunding: 0,
        contractCount: 0,
        totalAcres: 0,
        lastPracticeYear: 0,
        bmpBreakdown: {},
        lifetimeCostshareTotal: r.lifetimeCostshareTotal || 0,
        recordUrl: r.recordUrl || null,
        costShareUrl: r.costShareUrl || null,
        lat: r.lat,
        longitude: r.longitude,
        contracts: new Set(),
      }
    }
    const farm = farmMap[r.personId]
    farm.totalFunding += r.totalAmount
    farm.totalAcres += r.practiceAcres
    if (r.contractId) farm.contracts.add(r.contractId)
    if (r.projectYear > farm.lastPracticeYear) {
      farm.lastPracticeYear = r.projectYear
    }
    if (r.bmp) {
      if (!farm.bmpBreakdown[r.bmp]) {
        farm.bmpBreakdown[r.bmp] = { amount: 0, count: 0, acres: 0 }
      }
      farm.bmpBreakdown[r.bmp].amount += r.totalAmount
      farm.bmpBreakdown[r.bmp].count += 1
      farm.bmpBreakdown[r.bmp].acres += r.practiceAcres
    }
    if (r.recordUrl) farm.recordUrl = r.recordUrl
    if (r.costShareUrl) farm.costShareUrl = r.costShareUrl
    if (r.lat) farm.lat = r.lat
    if (r.longitude) farm.longitude = r.longitude
  })

  return Object.values(farmMap)
    .map((f) => ({
      ...f,
      contractCount: f.contracts.size,
      contracts: undefined,
      totalAcres: Math.round(f.totalAcres),
    }))
    .sort((a, b) => b.totalFunding - a.totalFunding)
}

export function computeCostShareInsights(metrics, fundingByYearData, bmpDistribution, rows) {
  const insights = []

  if (metrics) {
    insights.push({
      type: 'highlight',
      text: `Peak funding year was ${metrics.peakFundingYear} with ${formatInsightCurrency(
        fundingByYearData.find((y) => y.year === metrics.peakFundingYear)?.totalFunding || 0
      )} in total cost-share payments.`,
    })

    if (metrics.totalAcres > 0) {
      insights.push({
        type: 'info',
        text: `${formatInsightNumber(metrics.totalAcres)} acres impacted across ${metrics.totalFarms} farms with ${metrics.contractCount} contracts.`,
      })
    }

    if (metrics.nitrogenReduction > 0) {
      insights.push({
        type: 'positive',
        text: `Environmental impact: ${formatInsightNumber(metrics.nitrogenReduction)} lbs nitrogen, ${formatInsightNumber(metrics.phosphorusReduction)} lbs phosphorus, and ${formatInsightNumber(metrics.sedimentReduction)} tons sediment reduced (combined).`,
      })
    }
  }

  // Top BMP by contract count
  if (bmpDistribution.length > 0) {
    insights.push({
      type: 'highlight',
      text: `Most common practice: ${bmpDistribution[0].bmp} with ${bmpDistribution[0].count} contracts covering ${formatInsightNumber(bmpDistribution[0].totalAcres)} acres.`,
    })
  }

  // Top farm by funding
  const farms = computeAllFarms(rows)
  if (farms.length > 0) {
    insights.push({
      type: 'info',
      text: `Top recipient: ${farms[0].fullName} (${farms[0].farmName || 'unnamed farm'}) with ${formatInsightCurrency(farms[0].totalFunding)} in cost-share funding.`,
    })
  }

  return insights
}

export function getUniqueProjectYears(rows) {
  const years = new Set()
  rows.forEach((r) => { if (r.projectYear) years.add(r.projectYear) })
  return Array.from(years).sort()
}

export function getUniqueBMPs(rows) {
  const bmps = new Set()
  rows.forEach((r) => { if (r.bmp) bmps.add(r.bmp) })
  return Array.from(bmps).sort()
}

export function getUniqueSegments(rows) {
  const segs = new Set()
  rows.forEach((r) => { if (r.projectSegment) segs.add(r.projectSegment) })
  return Array.from(segs).sort()
}

export function getUniqueStreams(rows) {
  const streams = new Set()
  rows.forEach((r) => { if (r.stream) streams.add(r.stream) })
  return Array.from(streams).sort()
}
