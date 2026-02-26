import { useState, useMemo, Fragment } from 'react'
import { formatCurrencyFull } from '../../utils/formatters'
import './DataTable.css'

function CellContent({ col, row }) {
  const value = row[col.key]

  if (col.render === 'donorLink') {
    const url = row.recordUrl
    return url ? (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="donor-link"
        onClick={(e) => e.stopPropagation()}
      >
        {value ?? '—'}
      </a>
    ) : (value ?? '—')
  }

  if (col.render === 'historyLink') {
    const shouldShow = col.showIf ? row[col.showIf] : true
    if (!shouldShow || !value) return '—'
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="history-link"
        onClick={(e) => e.stopPropagation()}
      >
        View
      </a>
    )
  }

  if (col.render === 'externalLink') {
    return value ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="history-link"
        onClick={(e) => e.stopPropagation()}
      >
        View/Edit
      </a>
    ) : '—'
  }

  if (col.format === 'currency') {
    return formatCurrencyFull(value)
  }

  if (col.format === 'number') {
    return typeof value === 'number' ? value.toLocaleString() : (value ?? '—')
  }

  return value ?? '—'
}

export default function DataTable({ data, columns, onRowClick, searchPlaceholder, breakdownKey = 'giftTypeBreakdown' }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [search, setSearch] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        if (col.render === 'historyLink' || col.render === 'externalLink') return false
        const val = row[col.key]
        return val != null && String(val).toLowerCase().includes(q)
      })
    )
  }, [data, columns, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const toggleExpand = (personId) => {
    setExpandedRow((prev) => (prev === personId ? null : personId))
  }

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row)
    } else {
      const hasBreakdown = row[breakdownKey] && Object.keys(row[breakdownKey]).length > 0
      if (hasBreakdown) toggleExpand(row.personId)
    }
  }

  return (
    <div className="data-table-wrapper">
      <div className="data-table-controls">
        <input
          type="text"
          className="data-table-search"
          placeholder={searchPlaceholder || 'Search...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="data-table-count">
          {sorted.length} result{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="data-table-rank">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`data-table-th ${sortKey === col.key ? 'sorted' : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-indicator">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const isExpanded = expandedRow === row.personId
              const hasBreakdown = !onRowClick && row[breakdownKey] && Object.keys(row[breakdownKey]).length > 0
              const isClickable = onRowClick || hasBreakdown
              return (
                <Fragment key={row.personId || i}>
                  <tr
                    className={`${isClickable ? 'expandable-row' : ''} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => handleRowClick(row)}
                  >
                    <td className="data-table-rank">{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} className={`${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
                        {col.key === 'fullName' && hasBreakdown ? (
                          <span className="name-cell-content">
                            <span className="expand-icon">{isExpanded ? '▾' : '▸'}</span>
                            <CellContent col={col} row={row} />
                          </span>
                        ) : (
                          <CellContent col={col} row={row} />
                        )}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && hasBreakdown && (
                    <tr className="detail-row">
                      <td colSpan={columns.length + 1}>
                        <div className="detail-breakdown">
                          {Object.entries(row[breakdownKey])
                            .sort(([, a], [, b]) => b.amount - a.amount)
                            .map(([type, info]) => (
                              <div key={type} className="detail-item">
                                <span className="detail-type">{type}</span>
                                <span className="detail-amount">{formatCurrencyFull(info.amount)}</span>
                                <span className="detail-count">({info.count} txn{info.count !== 1 ? 's' : ''})</span>
                              </div>
                            ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
