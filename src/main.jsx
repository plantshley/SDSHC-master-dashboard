import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import PasswordGate from './components/PasswordGate/PasswordGate'
import App from './App'
import HomePage from './pages/HomePage'
import DonorDashboard from './pages/DonorDashboard'
import VendorDashboard from './pages/VendorDashboard'
import CostShareDashboard from './pages/CostShareDashboard'
import MasterDashboard from './pages/MasterDashboard'
import './index.css'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <PasswordGate>
      <DataProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="donor" element={<DonorDashboard />} />
            <Route path="vendor" element={<VendorDashboard />} />
            <Route path="cost-share" element={<CostShareDashboard />} />
            <Route path="master" element={<MasterDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DataProvider>
      </PasswordGate>
    </HashRouter>
  </React.StrictMode>
)
