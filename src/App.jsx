import { useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar'
import { routeToTheme } from './theme/themeConfig'

export default function App() {
  const location = useLocation()

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
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
