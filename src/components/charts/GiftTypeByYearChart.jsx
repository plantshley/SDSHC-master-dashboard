import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { CHART_COLORS, legendStyle, CustomTooltipContent, currencyFormatter } from './chartConfig'

export default function GiftTypeByYearChart({ data, giftTypes }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          tickFormatter={currencyFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={70}
        />
        <Tooltip content={<CustomTooltipContent valueFormatter={currencyFormatter} />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Legend
          {...legendStyle}
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ ...legendStyle.wrapperStyle, right: -5, lineHeight: '20px' }}
        />
        {giftTypes.map((type, i) => (
          <Bar
            key={type}
            dataKey={type}
            stackId="a"
            fill={CHART_COLORS[i % CHART_COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
