import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { legendStyle, CustomTooltipContent, currencyFormatter } from './chartConfig'

const COLORS = {
  allocated: '#4CA5C2',
  used: '#7B68AE',
  available: '#5CAB7D',
}

export default function BudgetOverviewChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="segment"
          tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          tickFormatter={currencyFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={70}
        />
        <Tooltip content={<CustomTooltipContent valueFormatter={currencyFormatter} />} />
        <Legend
          {...legendStyle}
          wrapperStyle={{ ...legendStyle.wrapperStyle, paddingTop: 12 }}
        />
        <Bar dataKey="allocated" name="Allocated" fill={COLORS.allocated} radius={[4, 4, 0, 0]} />
        <Bar dataKey="used" name="Used" fill={COLORS.used} radius={[4, 4, 0, 0]} />
        <Bar dataKey="available" name="Available" fill={COLORS.available} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
