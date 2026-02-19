import './Placeholder.css'

export default function Placeholder({ title }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">◇</div>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-text">Coming soon</p>
    </div>
  )
}
