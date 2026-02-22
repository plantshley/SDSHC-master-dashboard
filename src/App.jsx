import { useEffect, useCallback } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar'
import { routeToTheme } from './theme/themeConfig'
import { AUTH_KEY } from './components/PasswordGate/PasswordGate'

export default function App() {
  const location = useLocation()

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    window.location.reload()
  }, [])

  useEffect(() => {
    const theme = routeToTheme[location.pathname] || 'master'
    document.documentElement.setAttribute('data-theme', theme)
  }, [location.pathname])

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">SDSHC Data Hub</Link>
          <NavBar />
          <button className="app-logout-btn" onClick={handleLogout} title="Log out">
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
