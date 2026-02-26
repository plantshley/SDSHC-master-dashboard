import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { legendStyle, numberFormatter } from './chartConfig'

const COLORS = {
  nitrogen: '#4CA5C2',
  phosphorus: '#9370DB',
  sediment: '#FF69B4',
}

function EnvImpactTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  const d = payload[0].payload

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
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{d.fullName || label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: entry.color, display: 'inline-block', flexShrink: 0,
          }} />
          <span><strong>{entry.name}</strong>: {numberFormatter(entry.value)} lbs</span>
        </div>
      ))}
      {d.acres != null && <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>Acres: <strong>{numberFormatter(d.acres)}</strong></div>}
      {d.count != null && <div style={{ color: 'var(--text-muted)' }}>Contracts: <strong>{d.count}</strong></div>}
    </div>
  )
}

export default function EnvironmentalImpactChart({ data }) {
  if (!data) return <div className="chart-empty">No data</div>

  const { totals, byBMP } = data

  // Build chart data: combined totals first, then top BMPs
  const chartData = [
    {
      name: 'Combined',
      fullName: 'Combined (All Practices)',
      Nitrogen: totals.nCombined,
      Phosphorus: totals.pCombined,
      Sediment: totals.sCombined,
    },
    ...byBMP.map((b) => ({
      name: b.bmp.length > 20 ? b.bmp.slice(0, 18) + '…' : b.bmp,
      fullName: b.bmp,
      Nitrogen: b.nitrogen,
      Phosphorus: b.phosphorus,
      Sediment: b.sediment,
      acres: b.acres,
      count: b.count,
    })),
  ]

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono'}}
            stroke="var(--text-muted)"
            interval={0}
            angle={-0}
            textAnchor="middle"
            height={30}
            
          />
          <YAxis
            tickFormatter={numberFormatter}
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="var(--text-muted)"
            width={60}
          />
          <Tooltip content={<EnvImpactTooltip />} cursor={{ fill: 'var(--accent-bg)' }} />
          <Legend
            {...legendStyle}
            wrapperStyle={{ ...legendStyle.wrapperStyle, paddingTop: 10 }}
          />
          <Bar dataKey="Nitrogen" fill={COLORS.nitrogen} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Phosphorus" fill={COLORS.phosphorus} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Sediment" fill={COLORS.sediment} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{
        fontSize: '12px',
        fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: 15,
      }}>
        "Combined" reflects synergistic reductions from multiple practices on the same land
      </div>
    </div>
  )
}
