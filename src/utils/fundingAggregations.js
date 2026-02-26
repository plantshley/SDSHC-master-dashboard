export function computeBudgetBySegment(fundingRows) {
  const segMap = {}

  fundingRows.forEach((r) => {
    if (!r.segment) return
    if (!segMap[r.segment]) {
      segMap[r.segment] = { segment: `Segment ${r.segment}`, allocated: 0, used: 0, available: 0 }
    }
    segMap[r.segment].allocated += r.amountAllocated
    segMap[r.segment].used += r.amountUsed
    segMap[r.segment].available += r.amountAvailable
  })

  return Object.values(segMap)
    .map((s) => ({
      ...s,
      utilizationPct: s.allocated > 0 ? (s.used / s.allocated) * 100 : 0,
    }))
    .sort((a, b) => a.segment.localeCompare(b.segment))
}

export function computeFundingBySource(fundingRows) {
  const sourceMap = {}

  fundingRows.forEach((r) => {
    if (!r.fundName) return
    if (!sourceMap[r.fundName]) {
      sourceMap[r.fundName] = { name: r.fundName, allocated: 0, used: 0 }
    }
    sourceMap[r.fundName].allocated += r.amountAllocated
    sourceMap[r.fundName].used += r.amountUsed
  })

  return Object.values(sourceMap)
    .map((s) => ({
      ...s,
      utilizationPct: s.allocated > 0 ? (s.used / s.allocated) * 100 : 0,
    }))
    .sort((a, b) => b.allocated - a.allocated)
}

export function computeBudgetByBMPType(fundingRows) {
  const typeMap = {}

  fundingRows.forEach((r) => {
    if (!r.bmpType) return
    if (!typeMap[r.bmpType]) {
      typeMap[r.bmpType] = { name: r.bmpType, allocated: 0, used: 0 }
    }
    typeMap[r.bmpType].allocated += r.amountAllocated
    typeMap[r.bmpType].used += r.amountUsed
  })

  return Object.values(typeMap)
    .map((s) => ({
      ...s,
      utilizationPct: s.allocated > 0 ? (s.used / s.allocated) * 100 : 0,
    }))
    .sort((a, b) => b.allocated - a.allocated)
}
