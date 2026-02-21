import { formatCurrency } from './formatters'

// Primary roles to extract from comma-separated Relationship field
const PRIMARY_ROLES = [
  'Donor', 'Vendor', 'Cost-share Recipient', 'Organization Contact',
  'Newsletter Email Only', 'Staff', 'Board Member', 'Board Advisor',
  'Organization or Business', 'Segment 1 Contact', 'Segment 2 Contact',
]

function parseRoles(relationship) {
  if (!relationship) return []
  return relationship.split(',').map((r) => r.trim()).filter(Boolean)
}

function matchesRole(relationship, role) {
  if (!relationship) return false
  return relationship.toLowerCase().includes(role.toLowerCase())
}

export function computeMasterMetrics(rows) {
  if (!rows || rows.length === 0) return null

  const totalPeople = rows.length
  const totalDonors = rows.filter((r) => matchesRole(r.relationship, 'Donor')).length
  const totalVendors = rows.filter((r) => matchesRole(r.relationship, 'Vendor')).length
  const totalCostShare = rows.filter((r) => matchesRole(r.relationship, 'Cost-share')).length
  const activeMembers = rows.filter((r) => r.membershipStatus === 'Current').length
  const totalLifetimeGiving = rows.reduce((sum, r) => sum + r.lifetimeGiftAmount, 0)
  const totalLifetimeVending = rows.reduce((sum, r) => sum + r.lifetimeVendingTotal, 0)
  const totalLifetimeCostshare = rows.reduce((sum, r) => sum + r.lifetimeCostshareTotal, 0)

  return {
    totalPeople,
    totalDonors,
    totalVendors,
    totalCostShare,
    activeMembers,
    totalLifetimeGiving,
    totalLifetimeVending,
    totalLifetimeCostshare,
  }
}

export function computeRelationshipBreakdown(rows) {
  const counts = {}
  rows.forEach((r) => {
    const roles = parseRoles(r.relationship)
    if (roles.length === 0) {
      counts['Unknown'] = (counts['Unknown'] || 0) + 1
      return
    }
    // Count each primary role the person holds
    const matched = new Set()
    roles.forEach((role) => {
      const primary = PRIMARY_ROLES.find((pr) => role.toLowerCase().includes(pr.toLowerCase()))
      if (primary) {
        matched.add(primary)
      }
    })
    if (matched.size === 0) {
      counts['Other'] = (counts['Other'] || 0) + 1
    } else {
      matched.forEach((m) => { counts[m] = (counts[m] || 0) + 1 })
    }
  })

  const totalPeople = rows.length
  return Object.entries(counts)
    .map(([status, count]) => ({
      status,
      count,
      percentage: totalPeople > 0 ? (count / totalPeople) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function computeMembershipBreakdown(rows) {
  const counts = {}
  rows.forEach((r) => {
    const status = r.membershipStatus || 'Unknown'
    counts[status] = (counts[status] || 0) + 1
  })

  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  return Object.entries(counts)
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function computeStateDistribution(rows) {
  const counts = {}
  rows.forEach((r) => {
    const state = r.state || 'Unknown'
    counts[state] = (counts[state] || 0) + 1
  })

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top10 = sorted.slice(0, 10)
  const otherCount = sorted.slice(10).reduce((sum, [, v]) => sum + v, 0)

  const result = top10.map(([name, value]) => ({ name, value }))
  if (otherCount > 0) {
    result.push({ name: 'Other', value: otherCount })
  }
  return result
}

export function computeEngagementMatrix(rows) {
  const roles = ['Donor', 'Vendor', 'Cost-share Recipient']
  const statuses = ['Current', 'Former', 'Never', 'Lifetime', 'Unknown', 'Deceased']

  return roles.map((role) => {
    const roleRows = rows.filter((r) => matchesRole(r.relationship, role))
    const entry = { role }
    statuses.forEach((status) => {
      entry[status] = roleRows.filter((r) => (r.membershipStatus || 'Unknown') === status).length
    })
    return entry
  })
}

export function computeFinancialSummaryByRole(rows) {
  const roles = ['Donor', 'Vendor', 'Cost-share Recipient', 'Organization Contact', 'Staff/Board']

  return roles.map((role) => {
    const roleRows = role === 'Staff/Board'
      ? rows.filter((r) => matchesRole(r.relationship, 'Staff') || matchesRole(r.relationship, 'Board'))
      : rows.filter((r) => matchesRole(r.relationship, role))
    return {
      role,
      giving: roleRows.reduce((sum, r) => sum + r.lifetimeGiftAmount, 0),
      vending: roleRows.reduce((sum, r) => sum + r.lifetimeVendingTotal, 0),
      costshare: roleRows.reduce((sum, r) => sum + r.lifetimeCostshareTotal, 0),
    }
  })
}

export function computeMasterInsights(metrics, rows) {
  if (!metrics) return []
  const insights = []

  // Active membership rate
  if (metrics.totalPeople > 0) {
    const pct = ((metrics.activeMembers / metrics.totalPeople) * 100).toFixed(1)
    insights.push({
      type: 'info',
      text: `${metrics.activeMembers} active members (${pct}% of database).`,
    })
  }

  // Former member re-engagement
  const formerCount = rows.filter((r) => r.membershipStatus === 'Former').length
  if (formerCount > 0) {
    const pct = ((formerCount / metrics.totalPeople) * 100).toFixed(1)
    insights.push({
      type: 'opportunity',
      text: `${formerCount} former members (${pct}%) — re-engagement opportunity.`,
    })
  }

  // Top contributor
  const topByGiving = [...rows].sort((a, b) => b.lifetimeGiftAmount - a.lifetimeGiftAmount)[0]
  if (topByGiving && topByGiving.lifetimeGiftAmount > 0) {
    insights.push({
      type: 'highlight',
      text: `Top contributor: ${topByGiving.fullName} with ${formatCurrency(topByGiving.lifetimeGiftAmount)} lifetime giving.`,
    })
  }

  // Geographic concentration
  const sdCount = rows.filter((r) => r.state === 'SD').length
  if (sdCount > 0) {
    const pct = ((sdCount / metrics.totalPeople) * 100).toFixed(1)
    insights.push({
      type: 'info',
      text: `${pct}% of records are based in South Dakota.`,
    })
  }

  return insights
}

export function getFilterOptions(rows) {
  // Extract unique primary roles from all Relationship values
  const roleSet = new Set()
  rows.forEach((r) => {
    const roles = parseRoles(r.relationship)
    roles.forEach((role) => {
      const primary = PRIMARY_ROLES.find((pr) => role.toLowerCase().includes(pr.toLowerCase()))
      if (primary) roleSet.add(primary)
    })
  })

  const membershipStatuses = [...new Set(rows.map((r) => r.membershipStatus).filter(Boolean))].sort()
  const states = [...new Set(rows.map((r) => r.state).filter(Boolean))].sort()
  const newsletterStatuses = [...new Set(rows.map((r) => r.newsletterStatus).filter(Boolean))].sort()

  return {
    relationships: [...roleSet].sort(),
    membershipStatuses,
    states,
    newsletterStatuses,
  }
}
