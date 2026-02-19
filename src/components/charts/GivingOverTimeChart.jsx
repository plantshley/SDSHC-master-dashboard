import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { tooltipStyle, currencyFormatter } from './chartConfig'

export default function GivingOverTimeChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          yAxisId="left"
          tickFormatter={currencyFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={70}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value, name) => [
            currencyFormatter(value),
            name === 'totalGiving' ? 'Total Giving' : 'Membership Giving',
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', fontFamily: 'MuseoModerno' }}
          formatter={(value) =>
            value === 'totalGiving' ? 'Total Giving' : 'Membership Giving'
          }
        />
        <Bar
          yAxisId="left"
          dataKey="totalGiving"
          fill="var(--accent)"
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="membershipGiving"
          stroke="#FF69B4"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#FF69B4' }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
