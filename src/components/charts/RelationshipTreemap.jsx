import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import { CHART_COLORS } from './chartConfig'

const SMALL_THRESHOLD = 6 // percent — items below this get legend instead of label

function wrapText(text, maxCharsPerLine) {
  if (!text) return []
  const words = text.split(' ')
  const lines = []
  let current = ''
  words.forEach((word) => {
    if (current && (current + ' ' + word).length > maxCharsPerLine) {
      lines.push(current)
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  })
  if (current) lines.push(current)
  return lines
}

function CustomContent({ x, y, width, height, depth, name, count, fill, percentage }) {
  if (depth === 0 || !name || width < 4 || height < 4) return null

  // Always render the colored rect
  const isSmall = percentage < SMALL_THRESHOLD
  if (isSmall || width < 40 || height < 28) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} stroke="var(--card-bg, #fff)" strokeWidth={2} />
      </g>
    )
  }

  const maxChars = Math.floor(width / 7)
  const lines = wrapText(name, maxChars)
  const showCount = height > 30 + lines.length * 14
  const lineHeight = 14
  const totalTextHeight = lines.length * lineHeight + (showCount ? 16 : 0)
  const startY = y + (height - totalTextHeight) / 2 + lineHeight / 2

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} stroke="var(--card-bg, #fff)" strokeWidth={2} />
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + width / 2}
          y={startY + i * lineHeight}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={width < 70 ? 8 : 12}
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={600}
        >
          {line}
        </text>
      ))}
      {showCount && (
        <text
          x={x + width / 2}
          y={startY + lines.length * lineHeight + 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.75)"
          fontSize={12}
          fontFamily="'JetBrains Mono', monospace"
        >
          {(count || 0).toLocaleString()}
        </text>
      )}
    </g>
  )
}

function TreemapTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0].payload

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: item.fill,
          display: 'inline-block',
        }} />
        <strong>{item.name}</strong>
      </div>
      <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
        {item.count.toLocaleString()} people ({item.percentage.toFixed(1)}%)
      </div>
    </div>
  )
}

export default function RelationshipTreemap({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No data</div>

  const filtered = data.filter((d) => d.count > 0)

  const treemapData = filtered.map((d, i) => ({
    name: d.status,
    size: d.count,
    count: d.count,
    percentage: d.percentage,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  // Items too small to label in the treemap
  const legendItems = treemapData.filter((d) => d.percentage < SMALL_THRESHOLD)

  return (
    <div>
      <ResponsiveContainer width="100%" height={290}>
        <Treemap
          data={treemapData}
          dataKey="size"
          nameKey="name"
          content={<CustomContent />}
          animationDuration={400}
        >
          <Tooltip content={<TreemapTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      {legendItems.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 16px',
          marginTop: 10,
          justifyContent: 'center',
        }}>
          {legendItems.map((item) => (
            <div key={item.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--text-secondary)',
            }}>
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.fill,
                display: 'inline-block',
                flexShrink: 0,
              }} />
              {item.name} ({item.count.toLocaleString()})
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
