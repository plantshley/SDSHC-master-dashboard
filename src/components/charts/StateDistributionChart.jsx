import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { CustomTooltipContent, numberFormatter } from './chartConfig'

function countFormatter(value) {
  return `${numberFormatter(value)} people`
}

export default function StateDistributionChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={numberFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={60}
        />
        <Tooltip content={<CustomTooltipContent valueFormatter={countFormatter} />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Bar
          dataKey="value"
          name="People"
          fill="var(--accent)"
          fillOpacity={0.7}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
