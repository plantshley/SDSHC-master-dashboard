import './BentoCard.css'

export default function BentoCard({ title, children, colSpan = 1, rowSpan = 1, className = '' }) {
  const spanClass = colSpan === 4 ? 'bento-card--full'
    : colSpan === 3 ? 'bento-card--three'
    : colSpan === 2 ? 'bento-card--wide'
    : ''

  const rowClass = rowSpan === 2 ? 'bento-card--tall' : ''

  return (
    <div className={`bento-card ${spanClass} ${rowClass} ${className}`}>
      {title && (
        <div className="bento-card-header">
          <h3 className="bento-card-title">{title}</h3>
        </div>
      )}
      <div className="bento-card-content">
        {children}
      </div>
    </div>
  )
}
