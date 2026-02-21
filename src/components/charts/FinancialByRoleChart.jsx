import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { legendStyle, CustomTooltipContent, currencyFormatter } from './chartConfig'

function dollarFormatter(value) {
  return currencyFormatter(value)
}

function WrappedTick({ x, y, payload }) {
  const text = payload.value || ''
  const parts = text.match(/[\w]+[\s-]?/g) || [text]
  const lines = []
  let current = ''
  for (const part of parts) {
    if ((current + part).trim().length > 12 && current) {
      lines.push(current.trim())
      current = part
    } else {
      current += part
    }
  }
  if (current.trim()) lines.push(current.trim())

  return (
    <text x={x} y={y + 10} textAnchor="middle" fontSize={10} fontFamily="JetBrains Mono" fill="var(--text-muted)">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>{line}</tspan>
      ))}
    </text>
  )
}

export default function FinancialByRoleChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="role"
          tick={<WrappedTick />}
          stroke="var(--text-muted)"
          interval={0}
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
