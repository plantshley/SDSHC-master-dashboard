export function computeDonorMetrics(rows) {
  if (!rows || rows.length === 0) return null

  const uniqueDonors = new Set(rows.map((r) => r.personId).filter(Boolean))
  const totalTransactions = rows.length
  const lifetimeGiving = rows.reduce((sum, r) => sum + r.giftAmount, 0)
  const avgGiftSize = totalTransactions > 0 ? lifetimeGiving / totalTransactions : 0

  // Giving by year
  const yearMap = {}
  rows.forEach((r) => {
    if (!r.giftYear) return
    if (!yearMap[r.giftYear]) {
      yearMap[r.giftYear] = { total: 0, count: 0 }
    }
    yearMap[r.giftYear].total += r.giftAmount
    yearMap[r.giftYear].count += 1
  })

  const years = Object.keys(yearMap).map(Number).sort()
  const peakYear = years.reduce(
    (best, y) => (yearMap[y].total > (yearMap[best]?.total || 0) ? y : best),
    years[0]
  )

  // YoY growth (last two complete years)
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
    totalDonors: uniqueDonors.size,
    totalTransactions,
    lifetimeGiving,
    avgGiftSize,
    peakGivingYear: peakYear,
    yoyGrowth,
    yoyYears,
    dataYearRange: years.length > 0 ? `${years[0]} – ${years[years.length - 1]}` : '',
  }
}

export function computeGivingByYear(rows) {
  const yearMap = {}
  rows.forEach((r) => {
    if (!r.giftYear) return
    const y = r.giftYear
    if (!yearMap[y]) {
      yearMap[y] = { year: y, totalGiving: 0, membershipGiving: 0, membershipCount: 0, transactionCount: 0 }
    }
    yearMap[y].totalGiving += r.giftAmount
    yearMap[y].transactionCount += 1
    if (r.giftType && r.giftType.toLowerCase().includes('membership')) {
      yearMap[y].membershipGiving += r.giftAmount
      yearMap[y].membershipCount += 1
    }
  })

  return Object.values(yearMap).sort((a, b) => a.year - b.year)
}

export function computeMembershipStatus(rows) {
  const statusMap = {}
  const seen = new Set()

  rows.forEach((r) => {
    if (!r.personId || seen.has(r.personId)) return
    seen.add(r.personId)
    const status = r.membershipStatus || 'Unknown'
    statusMap[status] = (statusMap[status] || 0) + 1
  })

  const total = Object.values(statusMap).reduce((s, v) => s + v, 0)
  return Object.entries(statusMap)
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function computeGiftTypeByYear(rows) {
  const yearTypeMap = {}
  const allTypes = new Set()

  rows.forEach((r) => {
    if (!r.giftYear || !r.giftType) return
    const y = r.giftYear
    const t = r.giftType
    allTypes.add(t)
    if (!yearTypeMap[y]) yearTypeMap[y] = {}
    yearTypeMap[y][t] = (yearTypeMap[y][t] || 0) + r.giftAmount
  })

  const years = Object.keys(yearTypeMap).map(Number).sort()
  const giftTypes = Array.from(allTypes).sort()

  const data = years.map((year) => {
    const entry = { year }
    giftTypes.forEach((t) => {
      entry[t] = yearTypeMap[year][t] || 0
    })
    return entry
  })

  return { data, giftTypes }
}

export function computeTransactionVolume(rows) {
  const yearTypeMap = {}
  const allTypes = new Set()

  rows.forEach((r) => {
    if (!r.giftYear || !r.giftType) return
    const y = r.giftYear
    const t = r.giftType
    allTypes.add(t)
    if (!yearTypeMap[y]) yearTypeMap[y] = {}
    yearTypeMap[y][t] = (yearTypeMap[y][t] || 0) + 1
  })

  const years = Object.keys(yearTypeMap).map(Number).sort()
  const giftTypes = Array.from(allTypes).sort()

  const data = years.map((year) => {
    const entry = { year }
    giftTypes.forEach((t) => {
      entry[t] = yearTypeMap[year][t] || 0
    })
    return entry
  })

  return { data, giftTypes }
}

export function computeTopDonors(rows, limit = 25) {
  const donorMap = {}

  rows.forEach((r) => {
    if (!r.personId) return
    if (!donorMap[r.personId]) {
      donorMap[r.personId] = {
        personId: r.personId,
        fullName: r.fullName || 'Unknown',
        membershipStatus: r.membershipStatus || 'Unknown',
        lifetimeGiftAmount: r.lifetimeGiftAmount || 0,
        totalGiven: 0,
        transactionCount: 0,
        lastGiftYear: 0,
      }
    }
    donorMap[r.personId].totalGiven += r.giftAmount
    donorMap[r.personId].transactionCount += 1
    if (r.giftYear > donorMap[r.personId].lastGiftYear) {
      donorMap[r.personId].lastGiftYear = r.giftYear
    }
  })

  return Object.values(donorMap)
    .sort((a, b) => b.totalGiven - a.totalGiven)
    .slice(0, limit)
}

export function computeInsights(metrics, givingByYear, membershipStatus, rows) {
  const insights = []

  if (metrics) {
    insights.push({
      type: 'highlight',
      text: `Peak giving year was ${metrics.peakGivingYear} with ${formatInsightCurrency(
        givingByYear.find((y) => y.year === metrics.peakGivingYear)?.totalGiving || 0
      )} in total contributions.`,
    })

    if (metrics.yoyGrowth !== null) {
      const direction = metrics.yoyGrowth >= 0 ? 'increase' : 'decrease'
      insights.push({
        type: metrics.yoyGrowth >= 0 ? 'positive' : 'negative',
        text: `${Math.abs(metrics.yoyGrowth).toFixed(1)}% year-over-year ${direction} (${metrics.yoyYears}).`,
      })
    }

    insights.push({
      type: 'info',
      text: `${metrics.totalDonors.toLocaleString()} unique donors across ${metrics.totalTransactions.toLocaleString()} transactions spanning ${metrics.dataYearRange}.`,
    })
  }

  // Former donor re-engagement
  const formerDonors = membershipStatus.find(
    (s) => s.status.toLowerCase() === 'former'
  )
  if (formerDonors && formerDonors.percentage > 50) {
    insights.push({
      type: 'opportunity',
      text: `${formerDonors.percentage.toFixed(0)}% of donors are Former members — a significant re-engagement opportunity.`,
    })
  }

  // Membership vs total giving
  const membershipRows = rows.filter(
    (r) => r.giftType && r.giftType.toLowerCase().includes('membership')
  )
  const membershipPctTransactions = rows.length > 0
    ? (membershipRows.length / rows.length) * 100
    : 0
  const membershipPctDollars = metrics?.lifetimeGiving > 0
    ? (membershipRows.reduce((s, r) => s + r.giftAmount, 0) / metrics.lifetimeGiving) * 100
    : 0

  if (membershipPctTransactions > 40 && membershipPctDollars < 10) {
    insights.push({
      type: 'info',
      text: `Membership accounts for ${membershipPctTransactions.toFixed(0)}% of transactions but only ${membershipPctDollars.toFixed(0)}% of total giving dollars.`,
    })
  }

  // Top donor
  const topDonors = computeTopDonors(rows, 1)
  if (topDonors.length > 0) {
    insights.push({
      type: 'highlight',
      text: `Top contributor: ${topDonors[0].fullName} with ${formatInsightCurrency(topDonors[0].totalGiven)} in total giving.`,
    })
  }

  return insights
}

function formatInsightCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

export function getUniqueGiftTypes(rows) {
  const types = new Set()
  rows.forEach((r) => {
    if (r.giftType) types.add(r.giftType)
  })
  return Array.from(types).sort()
}

export function getUniqueYears(rows) {
  const years = new Set()
  rows.forEach((r) => {
    if (r.giftYear) years.add(r.giftYear)
  })
  return Array.from(years).sort()
}

export function getUniqueMembershipStatuses(rows) {
  const statuses = new Set()
  rows.forEach((r) => {
    if (r.membershipStatus) statuses.add(r.membershipStatus)
  })
  return Array.from(statuses).sort()
}
