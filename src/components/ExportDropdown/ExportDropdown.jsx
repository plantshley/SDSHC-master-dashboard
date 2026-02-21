import { useState, useRef, useEffect } from 'react'
import './ExportDropdown.css'

export default function ExportDropdown({ onExportImage, onExportChartData, onExportTableData, tableDataLabel }) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (type, fn) => {
    setExporting(type)
    setOpen(false)
    try {
      await fn()
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="export-dropdown-wrapper" ref={ref}>
      <button
        className="export-btn"
        onClick={() => setOpen(!open)}
        disabled={!!exporting}
      >
        {exporting ? 'Exporting...' : 'Export \u25BC'}
      </button>
      {open && (
        <div className="export-dropdown">
          <button
            className="export-dropdown-item"
            onClick={() => handleExport('image', onExportImage)}
          >
            Export as Image (PNG)
          </button>
          <button
            className="export-dropdown-item"
            onClick={() => handleExport('chart', onExportChartData)}
          >
            Export Data (Excel)
          </button>
          <button
            className="export-dropdown-item"
            onClick={() => handleExport('table', onExportTableData)}
          >
            {tableDataLabel || 'Export Table Data (Excel)'}
          </button>
        </div>
      )}
    </div>
  )
}
