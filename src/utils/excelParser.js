import * as XLSX from 'xlsx'

const EXPECTED_DONOR_COLUMNS = [
  'FullName', 'PersonID', 'MembershipStatus', 'Gift Year',
  'Gift Amount', 'Gift Type', 'LifetimeGiftAmount'
]

function normalizeValue(val) {
  if (val === null || val === undefined || val === '') return null
  return val
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function parseExcelDate(val) {
  if (!val) return null
  if (typeof val === 'number') {
    return XLSX.SSF.parse_date_code(val)
  }
  const d = new Date(val)
  return isNaN(d.getTime()) ? null : d
}

export async function fetchAndParseExcel(baseUrl) {
  const url = `${baseUrl}data/Peoples Database Queries_local.xlsx`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  return {
    donorHistory: parseDonorHistory(workbook),
  }
}

function parseDonorHistory(workbook) {
  const sheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase().includes('donor history')
  )

  if (!sheetName) {
    throw new Error(
      `"Donor History" sheet not found. Available sheets: ${workbook.SheetNames.join(', ')}`
    )
  }

  const sheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null })

  // Validate expected columns
  if (rawRows.length > 0) {
    const cols = Object.keys(rawRows[0])
    const missing = EXPECTED_DONOR_COLUMNS.filter(
      (c) => !cols.some((col) => col.trim() === c)
    )
    if (missing.length > 0) {
      console.warn(`Donor History: missing expected columns: ${missing.join(', ')}`)
    }
  }

  return rawRows.map((row) => ({
    id: normalizeValue(row['Id']),
    personId: normalizeValue(row['PersonID'] || row['Person IDId']),
    fullName: normalizeValue(row['FullName']),
    firstName: normalizeValue(row['First Name']),
    lastName: normalizeValue(row['Last Name']),
    membershipStatus: normalizeValue(row['MembershipStatus']),
    lastMembershipYear: parseNumber(row['LastMembershipYear']),
    lifetimeGiftAmount: parseNumber(row['LifetimeGiftAmount']),
    giftDate: parseExcelDate(row['Gift Date']),
    giftYear: parseNumber(row['Gift Year'] || row['Gift Year0']),
    giftAmount: parseNumber(row['Gift Amount']),
    giftType: normalizeValue(row['Gift Type']),
    memo: normalizeValue(row['Memo']),
    description: normalizeValue(row['Description']),
    giftMonth: normalizeValue(row['Gift Month']),
    transactionSource: normalizeValue(row['Transaction Source']),
  }))
}
