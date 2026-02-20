import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { legendStyle, currencyFormatter, numberFormatter } from './chartConfig'

function DualAxisTooltip({ active, payload, label, filterNote }) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div style={{
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      borderRadius: '10px',
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: '1px solid var(--border-color)',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '12px',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{label}</div>
      {payload.map((entry, i) => {
        const displayName = entry.dataKey === 'membershipCount'
          ? 'Member Count'
          : filterNote ? 'Filtered Giving' : 'Total Giving'
        const displayValue = entry.dataKey === 'membershipCount'
          ? numberFormatter(entry.value)
          : currencyFormatter(entry.value)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: entry.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            <span>
              <strong>{displayName}</strong>: {displayValue}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function MembershipGivingDualAxis({ data, filterNote }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={380}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
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
          label={{ value: 'Giving ($)', angle: 90, position: 'insideRight', dx: 15, fontSize: 10, fontFamily: 'MuseoModerno', fill: 'var(--text-muted)' }}
        />
        <Tooltip content={<DualAxisTooltip filterNote={filterNote} />} cursor={{ fill: 'var(--accent-bg)' }} />
        <Legend
          {...legendStyle}
          wrapperStyle={{ ...legendStyle.wrapperStyle, paddingTop: 12 }}
          formatter={(value) => {
            if (value === 'membershipCount') return 'Member Count'
            if (filterNote) return `Filtered Giving (${filterNote})`
            return 'Total Giving'
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="membershipCount"
          name="membershipCount"
          fill="#FC38A4"
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalGiving"
          name="totalGiving"
          stroke="var(--accent)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: 'var(--accent)' }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
