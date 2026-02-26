import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CHART_COLORS, legendStyle } from './chartConfig'

const RADIAN = Math.PI / 180

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) {
  if (percentage < 2) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontFamily="JetBrains Mono"
      fontWeight={600}
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  )
}

function CustomPieTooltip({ active, payload, tooltipLabel, valueFormatter }) {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]
  const data = entry.payload
  const displayValue = valueFormatter ? valueFormatter(data.count) : data.count

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      color: 'var(--text-primary)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: entry.color || entry.payload.fill,
          display: 'inline-block',
          flexShrink: 0,
        }} />
        <span>
          <strong>{data.status}</strong>: {displayValue} {tooltipLabel} ({data.percentage.toFixed(1)}%)
        </span>
      </div>
    </div>
  )
}

export default function MembershipStatusChart({ data, tooltipLabel = 'donors', valueFormatter }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={110}
          dataKey="count"
          nameKey="status"
          label={renderCustomLabel}
          labelLine={false}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.status}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip tooltipLabel={tooltipLabel} valueFormatter={valueFormatter} />} />
        <Legend {...legendStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}
