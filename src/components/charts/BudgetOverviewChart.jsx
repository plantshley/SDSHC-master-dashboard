import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { legendStyle, currencyFormatter } from './chartConfig'

const COLORS = {
  allocated: '#4CA5C2',
  used: '#EE82EE',
  available: '#F0E68C',
}

function BudgetTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  const d = payload[0].payload

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
            width: 8, height: 8, borderRadius: '50%',
            background: entry.color, display: 'inline-block', flexShrink: 0,
          }} />
          <span><strong>{entry.name}</strong>: {currencyFormatter(entry.value)}</span>
        </div>
      ))}
      <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>
        Utilization: <strong>{d.utilizationPct != null ? d.utilizationPct.toFixed(1) : 0}%</strong>
      </div>
    </div>
  )
}

export default function BudgetOverviewChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={480}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="segment"
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          tickFormatter={currencyFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={70}
        />
        <Tooltip content={<BudgetTooltip />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Legend
          {...legendStyle}
          wrapperStyle={{ ...legendStyle.wrapperStyle, paddingTop: 12 }}
        />
        <Bar dataKey="allocated" name="Allocated" fill={COLORS.allocated} radius={[4, 4, 0, 0]} />
        <Bar dataKey="used" name="Used" fill={COLORS.used} radius={[4, 4, 0, 0]} />
        <Bar dataKey="available" name="Available" fill={COLORS.available} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
