import { useState, useRef, useEffect } from 'react'
import './FilterBar.css'

export default function FilterBar({ filters, onFilterChange, options }) {
  const hasActiveFilters = filters.yearStart || filters.yearEnd
    || (filters.giftTypes && filters.giftTypes.length > 0)
    || (filters.membershipStatuses && filters.membershipStatuses.length > 0)

  return (
    <div className="filter-bar">
      <div className="filter-bar-label">Filters</div>

      <div className="filter-group">
        <label className="filter-label">Year Range</label>
        <div className="filter-year-range">
          <select
            value={filters.yearStart || ''}
            onChange={(e) => onFilterChange({ ...filters, yearStart: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">From</option>
            {options.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="filter-range-sep">–</span>
          <select
            value={filters.yearEnd || ''}
            onChange={(e) => onFilterChange({ ...filters, yearEnd: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">To</option>
            {options.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <MultiSelect
        label="Gift Type"
        options={options.giftTypes}
        selected={filters.giftTypes || []}
        onChange={(val) => onFilterChange({ ...filters, giftTypes: val })}
      />

      <MultiSelect
        label="Status"
        options={options.membershipStatuses}
        selected={filters.membershipStatuses || []}
        onChange={(val) => onFilterChange({ ...filters, membershipStatuses: val })}
      />

      {hasActiveFilters && (
        <button
          className="filter-clear-btn"
          onClick={() => onFilterChange({ yearStart: null, yearEnd: null, giftTypes: [], membershipStatuses: [] })}
        >
          Clear All
        </button>
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
