import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { CustomTooltipContent, currencyFormatter } from './chartConfig'

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
    <div>
      <ResponsiveContainer width="100%" height={320}>
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
          <Tooltip content={<CustomTooltipContent valueFormatter={dollarFormatter} />} cursor={{ fill: 'var(--accent-bg)' }} />
          <Bar dataKey="giving" name="Giving" fill="#4CAF50" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          <Bar dataKey="vending" name="Vending" fill="#FC38A4" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          <Bar dataKey="costshare" name="Cost-share" fill="#2196F3" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 0, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
        {[{ name: 'Giving', color: '#4CAF50' }, { name: 'Vending', color: '#FC38A4' }, { name: 'Cost-share', color: '#2196F3' }].map((item) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  )
}
