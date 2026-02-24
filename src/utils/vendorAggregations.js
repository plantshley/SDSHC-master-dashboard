// Vendor names used to sub-categorize Accounts Payable rows
const AP_MEDIA_VENDORS = [
  'radio', 'broadcasting', 'midcontinent', 'impact marketing',
  'rooster radio', 'results radio', 'saga communications', 'television',
  'townsquare media', 'homeslice media', 'newscenter', 'nexstar',
  'lamar companies', 'forum communications', 'leeagri media', 'friends of sdpb',
  'fp-tsln-fre', 'agoutlook',
]
// FCC call-letter pattern: K or W followed by 2-4 letters (end of string, or followed by space/dash)
const AP_CALL_LETTER_RE = /^[kw][a-z]{2,4}([\s-]|$)/i
const AP_NEWSPAPER_VENDORS = [
  'journal', 'register', 'plainsman', 'gazette', 'press', 'news',
  'pioneer', 'review', 'courier', 'courant', 'current', 'weekly',
  'cattle business weekly', 'rfd newspapers', 'true dakotan',
  'central dakota times', 'hamlin county publishing', 'hand county publishing',
  'dakota farm talk', 'gatehouse media',
]
const AP_PRINTING_VENDORS = [
  'minuteman press', 'quality quick print', 'allegra', 'vanguard printing',
  'printing', 'bindery', 'alphagraphics', 'midstates group', 'performance press',
]
const AP_MARKETING_VENDORS = [
  '44i marketing', 'mcquillen creative', 'henkinschultz', 'johnson & richter creative',
  'geffdog designs', 'halo branded', 'national pen', 'make it mine designs',
  'championship awards', 'm & r signs', 'ag storytellers', 'amanda radke',
  'generation photography', 'vision video', 'molten audio', 'madison sound',
  'dakota giftware',
]
const AP_HOTEL_VENDORS = [
  'hotel', 'suites', 'lodge', 'ramkota', 'clubhouse',
  'holiday inn', 'best western', 'comfort', 'hampton', 'fairfield',
  'event center', 'abbey of the hills',
]
const AP_PERSONNEL_VENDORS = [
  'sd association of conservation districts', 'sd assoc of cons',
]
const AP_CREDIT_CARD_VENDORS = [
  'first national bank', 'bank of omaha',
]
// Words that indicate a business, not an individual person
const BUSINESS_INDICATORS = [
  'llc', 'inc', 'corp', 'co.', 'ltd', 'foundation', 'association', 'assoc',
  'district', 'company', 'services', 'labs', 'seeds', 'media', 'group',
  'systems', 'apps', 'food', 'cafe', 'bar', 'grill', 'grille', 'transport',
  'construction', 'insurance', 'enterprises', 'bureau', 'museum', 'extension',
  'solutions', 'office', 'center', 'church', 'club', 'brethren', 'university',
  'sdsu', 'press', 'publishing', 'toilets', 'sanitary', 'sanitation', 'plumbing',
  'supply', 'consulting', 'law', 'fund', 'coalition', 'action', 'ventures',
  'development', 'workshop', 'ranch', 'farms', 'farm', 'agronomy', 'laboratory',
  'laboratories', 'portables', 'portable', 'rent-all', 'rentals', 'designs',
  'creative', 'photography', 'video', 'audio', 'signs', 'awards', 'limousine',
  'bus ', 'truck', 'catering', 'foods', 'lockbox', 'wireless', 'pavilion', 'pavillion',
  'sportsman', 'legion', 'fest', 'storytellers', 'sd ', 'south dakota',
  'nonprofit', 'hutterian', 'conservation', 'r&d', 'rc&d', 'lines',
  'communications', 'county', 'state of',
]

// Category aggregation mapping: raw Split Note → aggregated category
const CATEGORY_LOOKUP = new Map([
  // Contractual: people → Personnel, businesses → Contractual (handled in function)
  ['Contractual', 'Contractual'],
  ['Soil Health School', 'Soil Health School'],
  ['Annual Meeting', 'Annual Meeting'],
  // Cost-Share
  ['On Farm Trial', 'Cost-Share'],
  ['8200 DANR/319 Grant Expense', 'Cost-Share'],
  // Information & Education (includes former test plots/demos)
  ['Test Plots', 'Information & Education'],
  ['Test plots', 'Information & Education'],
  ['Demo Plots I&E', 'Information & Education'],
  ['Demonstration Supplies', 'Information & Education'],
  ['Information Distribution', 'Information & Education'],
  ['Education', 'Information & Education'],
  ['Information and Education', 'Information & Education'],
  ['Literature', 'Information & Education'],
  ['Printed', 'Information & Education'],
  // Media Production
  ['Audio', 'Media Production'],
  ['Video', 'Media Production'],
  ['Videos', 'Media Production'],
  ['Commercials', 'Media Production'],
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
  ['NR206740 CA C010', 'Grants & Projects'],
  ['8300 Other Governmental Grant', 'Grants & Projects'],
  ['8100 Contribution Agreement', 'Grants & Projects'],
  ['NFWF', 'Grants & Projects'],
  ['Youth', 'Grants & Projects'],
])

// Exported for the category info popover
export const VENDOR_CATEGORY_MAP = {
  'Contractual': ['Contractual (businesses/orgs only)'],
  'Soil Health School': ['Soil Health School'],
  'Annual Meeting': ['Annual Meeting', 'AP: hotels, venues, event centers'],
  'Cost-Share': ['On Farm Trial', '8200 DANR/319 Grant Expense', 'AP/SPLIT memos: cover crop, cost share, on farm trial, 319, DANR'],
  'Information & Education': ['Information Distribution', 'Education', 'Information and Education', 'Literature', 'Printed', 'Test Plots', 'Demo Plots I&E', 'Demonstration Supplies', 'AP: printing companies, test plot/demo memos'],
  'Media Production': ['Audio', 'Video', 'Videos', 'Commercials'],
  'Workshops & Events': ['Workshops', 'Workshop Expense', 'Booths', 'Bus Tours Field Walks', 'Meals and Entertainment'],
  'Supplies & Office': ['Supplies', 'Office Supplies', 'Computer and Internet Expenses'],
  'Marketing & Outreach': ['Advertising and Promotion', 'Influencer Outreach', 'Social Med promo influ outreach', 'Website', 'Website Expenses', 'Website, social media', 'Newsletter', 'FFA, 4H, Envirothon', 'Voices for Soil Health', 'AP: radio/TV stations, newspapers, marketing agencies'],
  'Personnel': ['Personnel/Wages', 'Salary', 'Personnel', 'Intern', 'Personnel Expenses', 'Non Salary', 'Mentoring', 'Mentors', 'Contractual (individuals)', '-SPLIT- (default)', 'AP: individual people, SDACD'],
  'Professional & Admin': ['Professional Fees', 'General Liability Insurance', 'Tax Expense', 'Bank Service Charges', 'Dues and Subscriptions', 'Rent Expense', 'Indirect', 'Travel'],
  'Soil Health Programs': ['Soil Health Buckets/Quilt', 'Soil Health Planner', 'Infiltration kits', 'Soil Health Bucket Procurement', 'Soil Health Buckets', 'Soil Health Promotional', 'Survey'],
  'Grants & Projects': ['NR206740XXXC012', 'NR196740G002', '8402 SARE Soil Quilt', '8401 Custer Peak Virtual', '8400 Private Foundation/Org Exp', 'NR206740 CA C010', '8300 Other Governmental Grant', '8100 Contribution Agreement', 'NFWF', 'Youth'],
  'Credit Card': ['AP: First National Bank of Omaha (credit card payments)'],
  'Uncategorized': ['Remaining Accounts Payable businesses & records with no Split Note'],
}

// Detect if a vendor name looks like an individual person (not a business)
function looksLikePersonName(lowerName) {
  // Strip parenthetical content like "(K & E Anderson Family Ranch)"
  const cleaned = lowerName.replace(/\(.*?\)/g, '').trim()
  // Remove "and" joining (e.g., "Austin and Baylee Carlson")
  const words = cleaned.split(/\s+/).filter((w) => w !== 'and' && w !== '&')
  // Person names are typically 2-4 words with no business indicators
  if (words.length < 2 || words.length > 4) return false
  return !BUSINESS_INDICATORS.some((b) => cleaned.includes(b))
}

export function aggregateVendorCategory(splitNote, memo, vendorName) {
  if (!splitNote) return 'Uncategorized'

  // Direct lookup
  const mapped = CATEGORY_LOOKUP.get(splitNote)
  if (mapped) {
    // Contractual individuals → Personnel
    if (mapped === 'Contractual' && vendorName && looksLikePersonName(vendorName.toLowerCase())) {
      return 'Personnel'
    }
    return mapped
  }

  // -SPLIT- handling: check memo for keywords
  if (splitNote === '-SPLIT-') {
    if (memo) {
      const lower = memo.toLowerCase()
      if (lower.includes('soil health school')) return 'Soil Health School'
      if (lower.includes('intern')) return 'Personnel'
      if (lower.includes('on farm trial') || lower.includes('cover crop') || lower.includes('cost share') || lower.includes('319') || lower.includes('danr')) return 'Cost-Share'
      if (lower.includes('test plot') || lower.includes('demo')) return 'Information & Education'
    }
    return 'Personnel' // default for -SPLIT- rows
  }

  // Accounts Payable sub-categorization by memo keywords and vendor name
  if (splitNote === 'Accounts Payable') {
    const lowerMemo = (memo || '').toLowerCase()
    const lowerVendor = (vendorName || '').toLowerCase()

    // Cost-share memo keywords (check first)
    if (lowerMemo.includes('on farm trial') || lowerMemo.includes('cover crop') || lowerMemo.includes('cost share') || lowerMemo.includes('319') || lowerMemo.includes('danr')) return 'Cost-Share'
    // I&E memo keywords (test plots, demos, rainfall simulators)
    if (lowerMemo.includes('test plot') || lowerMemo.includes('demo') || lowerMemo.includes('rainfall simulator')) return 'Information & Education'
    if (lowerMemo.includes('soil health school')) return 'Soil Health School'
    if (lowerMemo.includes('conference') || lowerMemo.includes('convention') || lowerMemo.includes('annual meeting')) return 'Annual Meeting'
    if (lowerMemo.includes('radio') || lowerMemo.includes('advertising') || lowerMemo.includes('commercial')) return 'Marketing & Outreach'

    // Credit card payments
    if (AP_CREDIT_CARD_VENDORS.some((v) => lowerVendor.includes(v))) return 'Credit Card'
    // Vendor name matching — media/radio/TV companies
    if (AP_MEDIA_VENDORS.some((v) => lowerVendor.includes(v))) return 'Marketing & Outreach'
    // FCC call-letter stations (K/W + 2-4 letters)
    if (AP_CALL_LETTER_RE.test(lowerVendor)) return 'Marketing & Outreach'
    // Newspapers
    if (AP_NEWSPAPER_VENDORS.some((v) => lowerVendor.includes(v))) return 'Marketing & Outreach'
    // Marketing/promo vendors
    if (AP_MARKETING_VENDORS.some((v) => lowerVendor.includes(v))) return 'Marketing & Outreach'
    // Printing companies
    if (AP_PRINTING_VENDORS.some((v) => lowerVendor.includes(v))) return 'Information & Education'
    // Hotels/venues → Annual Meeting
    if (AP_HOTEL_VENDORS.some((v) => lowerVendor.includes(v))) return 'Annual Meeting'
    // Known personnel/contract orgs
    if (AP_PERSONNEL_VENDORS.some((v) => lowerVendor.includes(v))) return 'Personnel'
    // Individual people (no business indicators in name) → Personnel
    if (looksLikePersonName(lowerVendor)) return 'Personnel'

    // Default remaining AP to Uncategorized
    return 'Uncategorized'
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
