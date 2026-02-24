import { useState, useRef, useEffect } from 'react'
import ExportDropdown from '../ExportDropdown/ExportDropdown'
import './FilterBar.css'

export default function FilterBar({ filters, onFilterChange, fields, clearFilters, exportHandlers, categoryInfoMap }) {
  const hasActiveFilters = fields.some((field) => {
    if (field.type === 'yearRange') {
      const [startKey, endKey] = field.key
      return filters[startKey] || filters[endKey]
    }
    const val = filters[field.key]
    return val && val.length > 0
  })

  return (
    <div className="filter-bar">
      <div className="filter-bar-label">Filters</div>

      {fields.map((field) => {
        if (field.type === 'yearRange') {
          const [startKey, endKey] = field.key
          return (
            <div key={field.label} className="filter-group">
              <label className="filter-label">{field.label}</label>
              <div className="filter-year-range">
                <select
                  value={filters[startKey] || ''}
                  onChange={(e) => onFilterChange({ ...filters, [startKey]: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">From</option>
                  {field.options.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <span className="filter-range-sep">–</span>
                <select
                  value={filters[endKey] || ''}
                  onChange={(e) => onFilterChange({ ...filters, [endKey]: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">To</option>
                  {field.options.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        }

        if (field.type === 'multiSelect') {
          return (
            <MultiSelect
              key={field.key}
              label={field.label}
              options={field.options}
              selected={filters[field.key] || []}
              onChange={(val) => onFilterChange({ ...filters, [field.key]: val })}
            />
          )
        }

        return null
      })}

      {categoryInfoMap && <CategoryInfoButton categoryInfoMap={categoryInfoMap} />}

      {hasActiveFilters && (
        <button
          className="filter-clear-btn"
          onClick={clearFilters}
        >
          Clear All
        </button>
      )}

      {exportHandlers && (
        <ExportDropdown
          onExportImage={exportHandlers.onExportImage}
          onExportChartData={exportHandlers.onExportChartData}
          onExportTableData={exportHandlers.onExportTableData}
          tableDataLabel={exportHandlers.tableDataLabel}
        />
      )}
    </div>
  )
}

function CategoryInfoButton({ categoryInfoMap }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const entries = Object.entries(categoryInfoMap)

  return (
    <div className="filter-info-wrapper" ref={ref}>
      <button
        className={`filter-info-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        title="View category groupings"
      >
        i
      </button>
      {open && (
        <div className="category-info-popover">
          <div className="category-info-title">Category Groupings</div>
          <div className="category-info-list">
            {entries.map(([category, rawValues]) => (
              <div key={category} className="category-info-group">
                <div className="category-info-heading">{category}</div>
                <div className="category-info-values">{rawValues.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val))
    } else {
      onChange([...selected, val])
    }
  }

  return (
    <div className="filter-group filter-multiselect" ref={ref}>
      <label className="filter-label">{label}</label>
      <button className="filter-select-btn" onClick={() => setOpen(!open)}>
        {selected.length > 0 ? `${selected.length} selected` : 'All'}
        <span className="filter-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="filter-dropdown">
          {options.map((opt) => (
            <label key={opt} className="filter-dropdown-item">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
