import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { legendStyle, numberFormatter } from './chartConfig'

function TimelineTooltip({ active, payload, label, leftLabel, rightLabel, leftFormatter, rightFormatter }) {
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
        const isLeft = i === 0
        const displayName = isLeft ? leftLabel : rightLabel
        const formatter = isLeft ? leftFormatter : rightFormatter
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: entry.color, display: 'inline-block', flexShrink: 0,
            }} />
            <span>
              <strong>{displayName}</strong>: {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function DualAxisTimelineChart({
  data,
  leftKey, leftLabel, leftColor,
  rightKey, rightLabel, rightColor,
  leftFormatter = numberFormatter,
  rightFormatter = numberFormatter,
}) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
        />
        <YAxis
          yAxisId="left"
          tickFormatter={leftFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={50}
          label={{ value: leftLabel, angle: -90, position: 'insideLeft', fontSize: 12, fontFamily: 'MuseoModerno', fill: 'var(--text-muted)' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={rightFormatter}
          tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          stroke="var(--text-muted)"
          width={60}
          label={{ value: rightLabel, angle: 90, position: 'insideRight', dx: 15, fontSize: 12, fontFamily: 'MuseoModerno', fill: 'var(--text-muted)' }}
        />
        <Tooltip
          content={
            <TimelineTooltip
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              leftFormatter={leftFormatter}
              rightFormatter={rightFormatter}
            />
          }
          cursor={{ fill: 'var(--accent-bg)' }}
        />
        <Legend
          {...legendStyle}
          wrapperStyle={{ ...legendStyle.wrapperStyle, paddingTop: 12 }}
          formatter={(value) => value === leftKey ? leftLabel : rightLabel}
        />
        <Bar
          yAxisId="left"
          dataKey={leftKey}
          name={leftKey}
          fill={leftColor}
          fillOpacity={0.7}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey={rightKey}
          name={rightKey}
          stroke={rightColor}
          strokeWidth={2.5}
          dot={{ r: 4, fill: rightColor }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
