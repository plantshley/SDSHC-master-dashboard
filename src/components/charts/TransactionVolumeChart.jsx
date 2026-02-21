import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { CHART_COLORS, CustomTooltipContent, numberFormatter } from './chartConfig'

function txFormatter(value) {
  return `${numberFormatter(value)} transactions`
}

export default function TransactionVolumeChart({ data, giftTypes }) {
  const [hiddenTypes, setHiddenTypes] = useState(new Set())

  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  const toggleType = (type) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  return (
    <div className="tx-volume-wrapper">
      <ResponsiveContainer width="100%" height={320}>
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
          <Tooltip
            content={<CustomTooltipContent valueFormatter={txFormatter} />}
            cursor={{ fill: 'var(--accent-bg)' }}
          />
          {giftTypes.map((type, i) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART_COLORS[i % CHART_COLORS.length] }}
              activeDot={{ r: 5 }}
              hide={hiddenTypes.has(type)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="tx-legend">
        {giftTypes.map((type, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length]
          const isHidden = hiddenTypes.has(type)
          return (
            <button
              key={type}
              className={`tx-legend-item ${isHidden ? 'tx-legend-off' : ''}`}
              onClick={() => toggleType(type)}
              style={isHidden ? undefined : { color, borderColor: `${color}40` }}
            >
              <span
                className="tx-legend-dot"
                style={{ background: isHidden ? 'var(--text-muted)' : color }}
              />
              {type}
            </button>
          )
        })}
      </div>
    </div>
  )
}
