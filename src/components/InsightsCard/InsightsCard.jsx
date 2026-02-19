import './InsightsCard.css'

const ICONS = {
  highlight: '★',
  positive: '↑',
  negative: '↓',
  opportunity: '◎',
  info: '●',
}

export default function InsightsCard({ insights }) {
  if (!insights || insights.length === 0) return null

  return (
    <div className="insights-card">
      <ul className="insights-list">
        {insights.map((insight, i) => (
          <li key={i} className={`insight-item insight-${insight.type}`}>
            <span className="insight-icon">{ICONS[insight.type] || '●'}</span>
            <span className="insight-text">{insight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
