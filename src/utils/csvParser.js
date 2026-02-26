import * as XLSX from 'xlsx'

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return 0
  // Handle currency strings like "$1,234.56" or "($1,234.56)" for negatives
  const cleaned = String(val).replace(/[$,]/g, '').replace(/\((.+)\)/, '-$1')
  const n = Number(cleaned)
  return isNaN(n) ? 0 : n
}

export async function fetchAndParseCSV(baseUrl, filename) {
  const url = `${baseUrl}data/${filename}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()
  const workbook = XLSX.read(text, { type: 'string' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null })

  return rawRows
    .filter((row) => {
      // Skip total/summary rows
      const bmp = row['BMP'] || ''
      return bmp && !bmp.toLowerCase().includes('total')
    })
    .map((row) => ({
      bmp: row['BMP'] || null,
      bmpType: row['BMP Type'] || null,
      fundName: row['Fund Name'] || null,
      amountAllocated: parseNumber(row['Amount Allocated']),
      amountUsed: parseNumber(row['Amount Used']),
      amountAvailable: parseNumber(row['Amount Available']),
      segment: String(row['Segment'] || '').trim(),
      startDate: row['Start'] || null,
      endDate: row['End'] || null,
    }))
}
