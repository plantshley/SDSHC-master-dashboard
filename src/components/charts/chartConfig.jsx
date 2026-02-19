import { CHART_COLORS } from '../../theme/themeConfig'

export { CHART_COLORS }

export const tooltipStyle = {
  contentStyle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
}

export const legendStyle = {
  wrapperStyle: { fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" },
}

export function CustomTooltipContent({ active, payload, label, valueFormatter }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={{
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: '1px solid var(--border-color)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: entry.color,
            display: 'inline-block',
            flexShrink: 0,
          }} />
          <span>
            <strong>{entry.name}</strong>: {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function currencyFormatter(value) {
  if (value == null || isNaN(value)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function numberFormatter(value) {
  if (value == null || isNaN(value)) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}
