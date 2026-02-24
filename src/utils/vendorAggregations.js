// Vendor names used to sub-categorize Accounts Payable rows
const AP_MEDIA_VENDORS = [
  'kcsd', 'kccr', 'kgfx', 'korn', 'kjam', 'knwc', 'kwat', 'kbrk', 'kimm',
  'ksdr', 'kota', 'kevn', 'kbhb', 'kdsj', 'kelo', 'wnax', 'kijv', 'kisd',
  'kmit', 'radio', 'broadcasting', 'midcontinent', 'impact marketing',
  'rooster radio', 'results radio', 'saga communications', 'tv', 'television',
]
const AP_PRINTING_VENDORS = [
  'minuteman press', 'quality quick print', 'allegra', 'vanguard printing',
  'printing', 'bindery',
]
const AP_HOTEL_VENDORS = [
  'hotel', 'inn', 'suites', 'lodge', 'ramkota', 'clubhouse', 'convention',
  'holiday inn', 'best western', 'comfort', 'hampton', 'fairfield',
]

// Category aggregation mapping: raw Split Note → aggregated category
const CATEGORY_LOOKUP = new Map([
  ['Contractual', 'Contractual'],
  ['Soil Health School', 'Soil Health School'],
  ['Annual Meeting', 'Annual Meeting'],
  // On Farm Trials & Demos
  ['On Farm Trial', 'On Farm Trials & Demos'],
  ['Test Plots', 'On Farm Trials & Demos'],
  ['Test plots', 'On Farm Trials & Demos'],
  ['Demo Plots I&E', 'On Farm Trials & Demos'],
  ['Demonstration Supplies', 'On Farm Trials & Demos'],
  // Media Production
  ['Audio', 'Media Production'],
  ['Video', 'Media Production'],
  ['Videos', 'Media Production'],
  ['Commercials', 'Media Production'],
  // Information & Education
  ['Information Distribution', 'Information & Education'],
  ['Education', 'Information & Education'],
  ['Information and Education', 'Information & Education'],
  ['Literature', 'Information & Education'],
  ['Printed', 'Information & Education'],
  // Workshops & Events
  ['Workshops', 'Workshops & Events'],
  ['Workshop Expense', 'Workshops & Events'],
  ['Booths', 'Workshops & Events'],
  ['Bus Tours Field Walks', 'Workshops & Events'],
  ['Meals and Entertainment', 'Workshops & Events'],
  // Supplies & Office
  ['Supplies', 'Supplies & Office'],
  ['Office Supplies', 'Supplies & Office'],
  ['Computer and Internet Expenses', 'Supplies & Office'],
  // Marketing & Outreach
  ['Advertising and Promotion', 'Marketing & Outreach'],
  ['Influencer Outreach', 'Marketing & Outreach'],
  ['Social Med promo influ outreach', 'Marketing & Outreach'],
  ['Website', 'Marketing & Outreach'],
  ['Website Expenses', 'Marketing & Outreach'],
  ['Website, social media', 'Marketing & Outreach'],
  ['Newsletter', 'Marketing & Outreach'],
  ['FFA, 4H, Envirothon', 'Marketing & Outreach'],
  ['Voices for Soil Health', 'Marketing & Outreach'],
  // Personnel
  ['Personnel/Wages', 'Personnel'],
  ['Salary', 'Personnel'],
  ['Personnel', 'Personnel'],
  ['Intern', 'Personnel'],
  ['Personnel Expenses', 'Personnel'],
  ['Non Salary', 'Personnel'],
  ['Mentoring', 'Personnel'],
  ['Mentors', 'Personnel'],
  // Professional & Admin
  ['Professional Fees', 'Professional & Admin'],
  ['General Liability Insurance', 'Professional & Admin'],
  ['Tax Expense', 'Professional & Admin'],
  ['Bank Service Charges', 'Professional & Admin'],
  ['Dues and Subscriptions', 'Professional & Admin'],
  ['Rent Expense', 'Professional & Admin'],
  ['Indirect', 'Professional & Admin'],
  ['Travel', 'Professional & Admin'],
  // Soil Health Programs
  ['Soil Health Buckets/Quilt', 'Soil Health Programs'],
  ['Soil Health Planner', 'Soil Health Programs'],
  ['Infiltration kits', 'Soil Health Programs'],
  ['Soil Health Bucket Procurement', 'Soil Health Programs'],
  ['Soil Health Buckets', 'Soil Health Programs'],
  ['Soil Health Promotional', 'Soil Health Programs'],
  ['Survey', 'Soil Health Programs'],
  // Grants & Projects
  ['NR206740XXXC012', 'Grants & Projects'],
  ['NR196740G002', 'Grants & Projects'],
  ['8402 SARE Soil Quilt', 'Grants & Projects'],
  ['8401 Custer Peak Virtual', 'Grants & Projects'],
  ['8400 Private Foundation/Org Exp', 'Grants & Projects'],
  ['8200 DANR/319 Grant Expense', 'Grants & Projects'],
  ['NR206740 CA C010', 'Grants & Projects'],
  ['8300 Other Governmental Grant', 'Grants & Projects'],
  ['8100 Contribution Agreement', 'Grants & Projects'],
  ['NFWF', 'Grants & Projects'],
  ['Youth', 'Grants & Projects'],
])

// Exported for the category info popover
export const VENDOR_CATEGORY_MAP = {
  'Contractual': ['Contractual'],
  'Soil Health School': ['Soil Health School'],
  'Annual Meeting': ['Annual Meeting', 'AP: hotels/venues (Ramkota, Holiday Inn, etc.)'],
  'On Farm Trials & Demos': ['On Farm Trial', 'Test Plots', 'Test plots', 'Demo Plots I&E', 'Demonstration Supplies'],
  'Media Production': ['Audio', 'Video', 'Videos', 'Commercials'],
  'Information & Education': ['Information Distribution', 'Education', 'Information and Education', 'Literature', 'Printed', 'AP: printing companies'],
  'Workshops & Events': ['Workshops', 'Workshop Expense', 'Booths', 'Bus Tours Field Walks', 'Meals and Entertainment'],
  'Supplies & Office': ['Supplies', 'Office Supplies', 'Computer and Internet Expenses'],
  'Marketing & Outreach': ['Advertising and Promotion', 'Influencer Outreach', 'Social Med promo influ outreach', 'Website', 'Website Expenses', 'Website, social media', 'Newsletter', 'FFA, 4H, Envirothon', 'Voices for Soil Health', 'AP: radio/TV stations & media companies'],
  'Personnel': ['Personnel/Wages', 'Salary', 'Personnel', 'Intern', 'Personnel Expenses', 'Non Salary', 'Mentoring', 'Mentors', '-SPLIT- (default)'],
  'Professional & Admin': ['Professional Fees', 'General Liability Insurance', 'Tax Expense', 'Bank Service Charges', 'Dues and Subscriptions', 'Rent Expense', 'Indirect', 'Travel'],
  'Soil Health Programs': ['Soil Health Buckets/Quilt', 'Soil Health Planner', 'Infiltration kits', 'Soil Health Bucket Procurement', 'Soil Health Buckets', 'Soil Health Promotional', 'Survey'],
  'Grants & Projects': ['NR206740XXXC012', 'NR196740G002', '8402 SARE Soil Quilt', '8401 Custer Peak Virtual', '8400 Private Foundation/Org Exp', '8200 DANR/319 Grant Expense', 'NR206740 CA C010', '8300 Other Governmental Grant', '8100 Contribution Agreement', 'NFWF', 'Youth'],
  'Misc/Other': ['Remaining Accounts Payable not matched by keyword or vendor name'],
}

export function aggregateVendorCategory(splitNote, memo, vendorName) {
  if (!splitNote) return 'Uncategorized'

  // Direct lookup
  const mapped = CATEGORY_LOOKUP.get(splitNote)
  if (mapped) return mapped

  // -SPLIT- handling: check memo for keywords
  if (splitNote === '-SPLIT-') {
    if (memo) {
      const lower = memo.toLowerCase()
      if (lower.includes('soil health school')) return 'Soil Health School'
      if (lower.includes('intern')) return 'Personnel'
      if (lower.includes('test plot')) return 'On Farm Trials & Demos'
      if (lower.includes('cover crop') || lower.includes('cost share')) return 'Soil Health Programs'
    }
    return 'Personnel' // default for -SPLIT- rows
  }

  // Accounts Payable sub-categorization by memo keywords and vendor name
  if (splitNote === 'Accounts Payable') {
    const lowerMemo = (memo || '').toLowerCase()
    const lowerVendor = (vendorName || '').toLowerCase()

    // Memo keyword matching
    if (lowerMemo.includes('on farm trial') || lowerMemo.includes('test plot')) return 'On Farm Trials & Demos'
    if (lowerMemo.includes('cover crop') || lowerMemo.includes('cost share')) return 'Soil Health Programs'
    if (lowerMemo.includes('soil health school')) return 'Soil Health School'
    if (lowerMemo.includes('conference') || lowerMemo.includes('convention') || lowerMemo.includes('annual meeting')) return 'Annual Meeting'
    if (lowerMemo.includes('radio') || lowerMemo.includes('ad ') || lowerMemo.includes('advertising') || lowerMemo.includes('commercial')) return 'Marketing & Outreach'

    // Vendor name matching — media/radio/TV companies
    if (AP_MEDIA_VENDORS.some((v) => lowerVendor.includes(v))) return 'Marketing & Outreach'
    // Printing companies
    if (AP_PRINTING_VENDORS.some((v) => lowerVendor.includes(v))) return 'Information & Education'
    // Hotels/venues → Annual Meeting
    if (AP_HOTEL_VENDORS.some((v) => lowerVendor.includes(v))) return 'Annual Meeting'

    // Default remaining AP to Misc/Other
    return 'Misc/Other'
  }

  return 'Uncategorized'
}

export function computeVendorMetrics(rows) {
  if (!rows || rows.length === 0) return null

  const uniqueVendors = new Set(rows.map((r) => r.personId).filter(Boolean))
  const totalTransactions = rows.length
  const lifetimeSpending = rows.reduce((sum, r) => sum + r.amount, 0)
  const avgPaymentSize = totalTransactions > 0 ? lifetimeSpending / totalTransactions : 0

  const yearMap = {}
  rows.forEach((r) => {
    if (!r.paymentYear) return
    if (!yearMap[r.paymentYear]) yearMap[r.paymentYear] = { total: 0, count: 0 }
    yearMap[r.paymentYear].total += r.amount
    yearMap[r.paymentYear].count += 1
  })

  const years = Object.keys(yearMap).map(Number).sort()
  const peakSpendingYear = years.reduce(
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
    totalVendors: uniqueVendors.size,
    totalTransactions,
    lifetimeSpending,
    avgPaymentSize,
    peakSpendingYear,
    yoyGrowth,
    yoyYears,
    dataYearRange: years.length > 0 ? `${years[0]} – ${years[years.length - 1]}` : '',
  }
}

export function computeSpendingByYear(rows) {
  const yearMap = {}
  const allTypes = new Set()

  rows.forEach((r) => {
    if (!r.paymentYear) return
    const y = r.paymentYear
    if (!yearMap[y]) {
      yearMap[y] = { year: y, totalGiving: 0, transactionCount: 0 }
    }
    yearMap[y].totalGiving += r.amount
    yearMap[y].transactionCount += 1
    if (r.paymentType) {
      allTypes.add(r.paymentType)
      yearMap[y][r.paymentType] = (yearMap[y][r.paymentType] || 0) + r.amount
    }
  })

  const data = Object.values(yearMap).sort((a, b) => a.year - b.year)
  const paymentTypes = Array.from(allTypes).sort()

  return { data, paymentTypes }
}

export function computePaymentTypeBreakdown(rows) {
  const typeMap = {}

  rows.forEach((r) => {
    const type = r.paymentType || 'Unknown'
    if (!typeMap[type]) typeMap[type] = { count: 0, amount: 0 }
    typeMap[type].count += 1
    typeMap[type].amount += r.amount
  })

  const total = Object.values(typeMap).reduce((s, v) => s + v.count, 0)
  return Object.entries(typeMap)
    .map(([status, info]) => ({
      status,
      count: info.count,
      percentage: total > 0 ? (info.count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function computeCategoryByYear(rows) {
  const yearCatMap = {}
  const allCategories = new Set()

  rows.forEach((r) => {
    if (!r.paymentYear) return
    const y = r.paymentYear
    const cat = aggregateVendorCategory(r.splitNote, r.memo, r.fullName)
    allCategories.add(cat)
    if (!yearCatMap[y]) yearCatMap[y] = {}
    yearCatMap[y][cat] = (yearCatMap[y][cat] || 0) + r.amount
  })

  const years = Object.keys(yearCatMap).map(Number).sort()
  const categories = Array.from(allCategories).sort()

  const data = years.map((year) => {
    const entry = { year }
    categories.forEach((cat) => {
      entry[cat] = yearCatMap[year][cat] || 0
    })
    return entry
  })

  return { data, categories }
}

export function computeTransactionVolumeByType(rows) {
  const yearTypeMap = {}
  const allTypes = new Set()

  rows.forEach((r) => {
    if (!r.paymentYear || !r.paymentType) return
    const y = r.paymentYear
    const t = r.paymentType
    allTypes.add(t)
    if (!yearTypeMap[y]) yearTypeMap[y] = {}
    yearTypeMap[y][t] = (yearTypeMap[y][t] || 0) + 1
  })

  const years = Object.keys(yearTypeMap).map(Number).sort()
  const paymentTypes = Array.from(allTypes).sort()

  const data = years.map((year) => {
    const entry = { year }
    paymentTypes.forEach((t) => {
      entry[t] = yearTypeMap[year][t] || 0
    })
    return entry
  })

  return { data, paymentTypes }
}

export function computeTransactionVolumeByCategory(rows) {
  const yearCatMap = {}
  const allCategories = new Set()

  rows.forEach((r) => {
    if (!r.paymentYear) return
    const y = r.paymentYear
    const cat = aggregateVendorCategory(r.splitNote, r.memo, r.fullName)
    allCategories.add(cat)
    if (!yearCatMap[y]) yearCatMap[y] = {}
    yearCatMap[y][cat] = (yearCatMap[y][cat] || 0) + 1
  })

  const years = Object.keys(yearCatMap).map(Number).sort()
  const categories = Array.from(allCategories).sort()

  const data = years.map((year) => {
    const entry = { year }
    categories.forEach((cat) => {
      entry[cat] = yearCatMap[year][cat] || 0
    })
    return entry
  })

  return { data, categories }
}

export function computeAllVendors(rows) {
  const vendorMap = {}

  rows.forEach((r) => {
    if (!r.personId) return
    if (!vendorMap[r.personId]) {
      vendorMap[r.personId] = {
        personId: r.personId,
        fullName: r.fullName || 'Unknown',
        totalSpent: 0,
        transactionCount: 0,
        lastPaymentYear: 0,
        paymentTypeBreakdown: {},
        categoryBreakdown: {},
        recordUrl: r.recordUrl || null,
        vendorUrl: r.vendorUrl || null,
        lifetimeVendingTotal: r.lifetimeVendingTotal || 0,
      }
    }
    vendorMap[r.personId].totalSpent += r.amount
    vendorMap[r.personId].transactionCount += 1
    if (r.paymentYear > vendorMap[r.personId].lastPaymentYear) {
      vendorMap[r.personId].lastPaymentYear = r.paymentYear
    }
    if (r.paymentType) {
      if (!vendorMap[r.personId].paymentTypeBreakdown[r.paymentType]) {
        vendorMap[r.personId].paymentTypeBreakdown[r.paymentType] = { amount: 0, count: 0 }
      }
      vendorMap[r.personId].paymentTypeBreakdown[r.paymentType].amount += r.amount
      vendorMap[r.personId].paymentTypeBreakdown[r.paymentType].count += 1
    }
    const cat = aggregateVendorCategory(r.splitNote, r.memo, r.fullName)
    if (!vendorMap[r.personId].categoryBreakdown[cat]) {
      vendorMap[r.personId].categoryBreakdown[cat] = { amount: 0, count: 0 }
    }
    vendorMap[r.personId].categoryBreakdown[cat].amount += r.amount
    vendorMap[r.personId].categoryBreakdown[cat].count += 1
    if (r.recordUrl) vendorMap[r.personId].recordUrl = r.recordUrl
    if (r.vendorUrl) vendorMap[r.personId].vendorUrl = r.vendorUrl
  })

  return Object.values(vendorMap)
    .sort((a, b) => b.totalSpent - a.totalSpent)
}

export function computeVendorInsights(metrics, spendingByYearData, paymentTypeBreakdown, rows) {
  const insights = []

  if (metrics) {
    insights.push({
      type: 'highlight',
      text: `Peak spending year was ${metrics.peakSpendingYear} with ${formatInsightCurrency(
        spendingByYearData.find((y) => y.year === metrics.peakSpendingYear)?.totalGiving || 0
      )} in total vendor payments.`,
    })
  }

  // Top vendor
  const allVendors = computeAllVendors(rows)
  if (allVendors.length > 0) {
    const top = allVendors[0]
    const pct = metrics.lifetimeSpending > 0
      ? ((top.totalSpent / metrics.lifetimeSpending) * 100).toFixed(0)
      : 0
    insights.push({
      type: 'highlight',
      text: `Top vendor: ${top.fullName} with ${formatInsightCurrency(top.totalSpent)} (${pct}% of total spending).`,
    })
  }

  // Category concentration (using aggregated categories)
  const catMap = {}
  rows.forEach((r) => {
    const cat = aggregateVendorCategory(r.splitNote, r.memo, r.fullName)
    catMap[cat] = (catMap[cat] || 0) + r.amount
  })
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  if (catEntries.length > 0) {
    const [topCat, topCatAmt] = catEntries[0]
    if (topCat !== 'Uncategorized') {
      const pct = metrics.lifetimeSpending > 0
        ? ((topCatAmt / metrics.lifetimeSpending) * 100).toFixed(0)
        : 0
      insights.push({
        type: 'info',
        text: `"${topCat}" is the top spending category at ${formatInsightCurrency(topCatAmt)} (${pct}% of total).`,
      })
    }
  }

  // Payment type concentration
  if (paymentTypeBreakdown.length > 0 && paymentTypeBreakdown[0].percentage > 90) {
    insights.push({
      type: 'info',
      text: `${paymentTypeBreakdown[0].percentage.toFixed(0)}% of transactions are "${paymentTypeBreakdown[0].status}" — very concentrated payment type.`,
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

export function getUniquePaymentTypes(rows) {
  const types = new Set()
  rows.forEach((r) => {
    if (r.paymentType) types.add(r.paymentType)
  })
  return Array.from(types).sort()
}

export function getUniqueVendorYears(rows) {
  const years = new Set()
  rows.forEach((r) => {
    if (r.paymentYear) years.add(r.paymentYear)
  })
  return Array.from(years).sort()
}

export function getUniqueCategories(rows) {
  const cats = new Set()
  rows.forEach((r) => {
    const cat = aggregateVendorCategory(r.splitNote, r.memo, r.fullName)
    if (cat !== 'Uncategorized') cats.add(cat)
  })
  return Array.from(cats).sort()
}
