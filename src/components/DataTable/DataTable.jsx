import { useState, useMemo, Fragment } from 'react'
import { formatCurrencyFull } from '../../utils/formatters'
import './DataTable.css'

export default function DataTable({ data, columns }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [search, setSearch] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
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

  return (
    <div className="data-table-wrapper">
      <div className="data-table-controls">
        <input
          type="text"
          className="data-table-search"
          placeholder="Search donors..."
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
              const hasBreakdown = row.giftTypeBreakdown && Object.keys(row.giftTypeBreakdown).length > 0
              return (
                <Fragment key={row.personId || i}>
                  <tr
                    className={`${hasBreakdown ? 'expandable-row' : ''} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => hasBreakdown && toggleExpand(row.personId)}
                  >
                    <td className="data-table-rank">{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
                        {col.key === 'fullName' && hasBreakdown && (
                          <span className="expand-icon">{isExpanded ? '▾' : '▸'}</span>
                        )}
                        {col.format === 'currency'
                          ? formatCurrencyFull(row[col.key])
                          : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && hasBreakdown && (
                    <tr className="detail-row">
                      <td colSpan={columns.length + 1}>
                        <div className="detail-breakdown">
                          {Object.entries(row.giftTypeBreakdown)
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
