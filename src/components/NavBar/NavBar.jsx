import { useNavigate, useLocation } from 'react-router-dom'
import NavButton from '../NavButton/NavButton'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import './NavBar.css'

const tabs = [
  { label: 'Master', path: '/master' },
  { label: 'Donor', path: '/donor' },
  { label: 'Vendor', path: '/vendor' },
  { label: 'Cost-Share', path: '/cost-share' },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="nav-bar">
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <NavButton
            key={tab.path}
            label={tab.label}
            active={location.pathname === tab.path}
            onClick={() => navigate(tab.path)}
          />
        ))}
      </div>
      <ThemeToggle />
    </nav>
  )
}
