import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { legendStyle, CustomTooltipContent, currencyFormatter } from './chartConfig'

function dollarFormatter(value) {
  return currencyFormatter(value)
}

export default function FinancialByRoleChart({ data }) {
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
          tickFormatter={currencyFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={70}
        />
        <Tooltip content={<CustomTooltipContent valueFormatter={dollarFormatter} />} />
        <Legend {...legendStyle} />
        <Bar dataKey="giving" name="Giving" fill="#4CAF50" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
        <Bar dataKey="vending" name="Vending" fill="#FC38A4" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
        <Bar dataKey="costshare" name="Cost-share" fill="#2196F3" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
