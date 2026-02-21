import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'

/**
 * Export a DOM element as a PNG image.
 */
export async function exportAsImage(element, filename = 'dashboard') {
  if (!element) return
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: false,
  })
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/**
 * Export chart/metrics data as a multi-sheet Excel workbook.
 */
export function exportChartDataExcel({ metrics, metricsTitle, sheets, filename }) {
  const wb = XLSX.utils.book_new()

  if (metrics) {
    const metricsRows = Object.entries(metrics).map(([key, value]) => ({
      Metric: formatMetricLabel(key),
      Value: value,
    }))
    const ws = XLSX.utils.json_to_sheet(metricsRows)
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, metricsTitle || 'Summary')
  }

  for (const sheet of sheets) {
    if (sheet.data && sheet.data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(sheet.data)
      XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(sheet.name))
    }
  }

  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export an array of row objects as an Excel file.
 */
export function exportTableData(rows, filename) {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Format a date value for Excel export. Handles Date objects, SheetJS {y,m,d} objects, and strings.
 */
export function formatDateForExport(val) {
  if (!val) return ''
  if (val instanceof Date) {
    return val.toLocaleDateString('en-US')
  }
  if (typeof val === 'object' && val.y) {
    return `${val.m + 1}/${val.d}/${val.y}`
  }
  return String(val)
}

function formatMetricLabel(camelCase) {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function sanitizeSheetName(name) {
  return name.replace(/[:\\/?*[\]]/g, '').substring(0, 31)
}
