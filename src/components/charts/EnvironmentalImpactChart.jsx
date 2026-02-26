import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { legendStyle, CustomTooltipContent, numberFormatter } from './chartConfig'

const COLORS = {
  nitrogen: '#4CA5C2',
  phosphorus: '#7B68AE',
  sediment: '#D4915E',
}

export default function EnvironmentalImpactChart({ data }) {
  if (!data) return <div className="chart-empty">No data</div>

  const { totals, byBMP } = data

  // Build chart data: combined totals first, then top BMPs
  const chartData = [
    {
      name: 'Combined',
      Nitrogen: Math.round(totals.nCombined),
      Phosphorus: Math.round(totals.pCombined),
      Sediment: Math.round(totals.sCombined),
    },
    ...byBMP.map((b) => ({
      name: b.bmp.length > 20 ? b.bmp.slice(0, 18) + '…' : b.bmp,
      Nitrogen: Math.round(b.nitrogen),
      Phosphorus: Math.round(b.phosphorus),
      Sediment: Math.round(b.sediment),
    })),
  ]

  return (
    <div style={{ width: '100%' }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }}
            stroke="var(--text-muted)"
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={numberFormatter}
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="var(--text-muted)"
            width={60}
          />
          <Tooltip content={<CustomTooltipContent valueFormatter={(v) => `${numberFormatter(v)} lbs`} />} />
          <Legend
            {...legendStyle}
            wrapperStyle={{ ...legendStyle.wrapperStyle, paddingTop: 4 }}
          />
          <Bar dataKey="Nitrogen" fill={COLORS.nitrogen} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Phosphorus" fill={COLORS.phosphorus} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Sediment" fill={COLORS.sediment} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{
        fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--text-muted)',
        textAlign: 'center',
        marginTop: 4,
      }}>
        "Combined" reflects synergistic reductions from multiple practices on the same land
      </div>
    </div>
  )
}
