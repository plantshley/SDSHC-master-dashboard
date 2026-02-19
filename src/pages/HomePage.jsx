import { useNavigate } from 'react-router-dom'
import { themes } from '../theme/themeConfig'
import './HomePage.css'

const dashboards = [
  { key: 'master', path: '/master', label: 'Master Dashboard', desc: 'All people & entities overview' },
  { key: 'donor', path: '/donor', label: 'Donor Dashboard', desc: 'Donor history, giving trends & insights' },
  { key: 'vendor', path: '/vendor', label: 'Vendor Dashboard', desc: 'Vendor payments & analysis' },
  { key: 'costshare', path: '/cost-share', label: 'Cost-Share Dashboard', desc: 'Cost-share projects & BMP data' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">SDSHC Master Dashboard</h1>
        <p className="home-subtitle">South Dakota Soil Health Coalition — Internal Data Hub</p>
      </div>

      <div className="home-grid">
        {dashboards.map((d) => {
          const theme = themes[d.key]
          return (
            <button
              key={d.key}
              className="home-card"
              style={{
                '--card-accent': theme.primary,
                '--card-accent-light': theme.light,
                '--card-accent-dark': theme.dark,
                '--card-accent-bg': theme.bg,
              }}
              onClick={() => navigate(d.path)}
            >
              <div className="home-card-inner">
                <div className="home-card-indicator" />
                <h2 className="home-card-title">{d.label}</h2>
                <p className="home-card-desc">{d.desc}</p>
                <span className="home-card-arrow">→</span>
                <div className="home-card-shine" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
