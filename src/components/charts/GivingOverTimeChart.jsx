import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { CHART_COLORS, legendStyle, currencyFormatter, CustomTooltipContent } from './chartConfig'

export default function GivingOverTimeChart({ data, giftTypes, selectedType, barLabel = 'Total Giving' }) {
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
        <Tooltip content={<CustomTooltipContent valueFormatter={currencyFormatter} />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Legend {...legendStyle} />
        <Bar
          yAxisId="left"
          dataKey="totalGiving"
          name={barLabel}
          fill="var(--accent)"
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        {selectedType && selectedType !== 'None' && giftTypes && (
          <Line
            yAxisId="left"
            type="monotone"
            dataKey={selectedType}
            name={selectedType}
            stroke={CHART_COLORS[giftTypes.indexOf(selectedType) % CHART_COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 4, fill: CHART_COLORS[giftTypes.indexOf(selectedType) % CHART_COLORS.length] }}
            activeDot={{ r: 6 }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
