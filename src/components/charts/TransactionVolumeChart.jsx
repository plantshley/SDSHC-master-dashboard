import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { CHART_COLORS, legendStyle, CustomTooltipContent, numberFormatter } from './chartConfig'

function txFormatter(value) {
  return `${numberFormatter(value)} transactions`
}

export default function TransactionVolumeChart({ data, giftTypes }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          tickFormatter={numberFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={50}
        />
        <Tooltip content={<CustomTooltipContent valueFormatter={txFormatter} />} />
        <Legend {...legendStyle} />
        {giftTypes.map((type, i) => (
          <Line
            key={type}
            type="monotone"
            dataKey={type}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS[i % CHART_COLORS.length] }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
