import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { legendStyle, currencyFormatter } from './chartConfig'

const COLORS = {
  allocated: '#4CA5C2',
  used: '#D4915E',
}

function SourceTooltip({ active, payload }) {
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
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{d.name}</div>
      <div>Allocated: <strong>{currencyFormatter(d.allocated)}</strong></div>
      <div>Used: <strong>{currencyFormatter(d.used)}</strong></div>
      <div>Utilization: <strong>{d.utilizationPct.toFixed(0)}%</strong></div>
    </div>
  )
}

export default function FundingBySourceChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  const chartData = data.map((d) => ({
    ...d,
    shortName: d.name.length > 25 ? d.name.slice(0, 23) + '…' : d.name,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 40)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={currencyFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          dataKey="shortName"
          type="category"
          width={150}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <Tooltip content={<SourceTooltip />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Legend
          {...legendStyle}
          wrapperStyle={{ ...legendStyle.wrapperStyle, paddingTop: 8 }}
        />
        <Bar dataKey="allocated" name="Allocated" fill={COLORS.allocated} radius={[0, 4, 4, 0]} />
        <Bar dataKey="used" name="Used" fill={COLORS.used} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
