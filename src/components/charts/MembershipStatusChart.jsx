import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CHART_COLORS, tooltipStyle } from './chartConfig'

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

export default function MembershipStatusChart({ data }) {
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
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.status}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          {...tooltipStyle}
          formatter={(value, name) => [
            `${value} donors (${data.find((d) => d.status === name)?.percentage.toFixed(1)}%)`,
            name,
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', fontFamily: 'MuseoModerno' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
