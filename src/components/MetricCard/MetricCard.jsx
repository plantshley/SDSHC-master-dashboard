import './MetricCard.css'

export default function MetricCard({ label, value, subtitle, trend }) {
  return (
    <div className="metric-card">
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-label">{label}</div>
      {subtitle && <div className="metric-card-subtitle">{subtitle}</div>}
      {trend !== undefined && trend !== null && (
        <div className={`metric-card-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          <span className="metric-card-trend-arrow">{trend >= 0 ? '↑' : '↓'}</span>
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  )
}
