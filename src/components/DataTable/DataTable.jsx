import { useState, useMemo } from 'react'
import { formatCurrencyFull } from '../../utils/formatters'
import './DataTable.css'

const PAGE_SIZE = 25

export default function DataTable({ data, columns }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('desc')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

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

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(0)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setPage(0)
  }

  return (
    <div className="data-table-wrapper">
      <div className="data-table-controls">
        <input
          type="text"
          className="data-table-search"
          placeholder="Search donors..."
          value={search}
          onChange={handleSearch}
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
            {pageData.map((row, i) => (
              <tr key={row.personId || i}>
                <td className="data-table-rank">{page * PAGE_SIZE + i + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className={col.align === 'right' ? 'text-right' : ''}>
                    {col.format === 'currency'
                      ? formatCurrencyFull(row[col.key])
                      : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="data-table-pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}
