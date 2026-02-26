import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS, currencyFormatter, numberFormatter } from './chartConfig'

function BMPTooltip({ active, payload }) {
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
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{d.bmp}</div>
      <div>Contracts: <strong>{d.count}</strong></div>
      <div>Acres: <strong>{numberFormatter(d.totalAcres)}</strong></div>
      <div>Funding: <strong>{currencyFormatter(d.totalFunding)}</strong></div>
    </div>
  )
}

export default function BMPDistributionChart({ data, maxItems = 10 }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  const chartData = data.slice(0, maxItems).map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
    // Truncate long BMP names for Y-axis
    shortBmp: d.bmp.length > 30 ? d.bmp.slice(0, 28) + '…' : d.bmp,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 36)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          dataKey="shortBmp"
          type="category"
          width={140}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <Tooltip content={<BMPTooltip />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <rect key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
