import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { legendStyle, CustomTooltipContent, currencyFormatter } from './chartConfig'

const SOURCE_COLORS = {
  total319: '#4CA5C2',
  totalOther: '#7B68AE',
  totalLocal: '#5CAB7D',
}

const SOURCE_LABELS = {
  total319: '319 Funds',
  totalOther: 'Other',
  totalLocal: 'Local',
}

export default function FundingOverTimeChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis
          dataKey="year"
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
        <Area
          type="monotone"
          dataKey="totalLocal"
          name={SOURCE_LABELS.totalLocal}
          stackId="1"
          fill={SOURCE_COLORS.totalLocal}
          stroke={SOURCE_COLORS.totalLocal}
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="totalOther"
          name={SOURCE_LABELS.totalOther}
          stackId="1"
          fill={SOURCE_COLORS.totalOther}
          stroke={SOURCE_COLORS.totalOther}
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="total319"
          name={SOURCE_LABELS.total319}
          stackId="1"
          fill={SOURCE_COLORS.total319}
          stroke={SOURCE_COLORS.total319}
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
