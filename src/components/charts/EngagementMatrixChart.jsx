import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { CHART_COLORS, legendStyle, CustomTooltipContent, numberFormatter } from './chartConfig'

const STATUSES = ['Current', 'Former', 'Never', 'Lifetime', 'Unknown']

function countFormatter(value) {
  return `${numberFormatter(value)} people`
}

export default function EngagementMatrixChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="role"
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          tickFormatter={numberFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={50}
        />
        <Tooltip content={<CustomTooltipContent valueFormatter={countFormatter} />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Legend {...legendStyle} />
        {STATUSES.map((status, i) => (
          <Bar
            key={status}
            dataKey={status}
            name={status}
            stackId="a"
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            fillOpacity={0.8}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
