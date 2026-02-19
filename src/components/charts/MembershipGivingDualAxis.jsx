import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { tooltipStyle, currencyFormatter, numberFormatter } from './chartConfig'

export default function MembershipGivingDualAxis({ data }) {
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
          tickFormatter={numberFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={50}
          label={{ value: 'Members', angle: -90, position: 'insideLeft', fontSize: 10, fontFamily: 'MuseoModerno', fill: 'var(--text-muted)' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={currencyFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={70}
          label={{ value: 'Giving ($)', angle: 90, position: 'insideRight', fontSize: 10, fontFamily: 'MuseoModerno', fill: 'var(--text-muted)' }}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value, name) => {
            if (name === 'membershipCount') return [numberFormatter(value), 'Member Count']
            return [currencyFormatter(value), 'Total Giving']
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', fontFamily: 'MuseoModerno' }}
          formatter={(value) =>
            value === 'membershipCount' ? 'Member Count' : 'Total Giving'
          }
        />
        <Bar
          yAxisId="left"
          dataKey="membershipCount"
          fill="#6A5ACD"
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalGiving"
          stroke="#FF6347"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#FF6347' }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
