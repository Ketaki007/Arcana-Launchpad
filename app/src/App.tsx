import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { FactorDashboardsPage } from './pages/FactorDashboardsPage'
import { LaunchpadPage } from './pages/LaunchpadPage'
import { ScenarioFab } from './components/ScenarioFab'
import { getDemoScenario } from './lib/demoScenario'
import {
  getAutoLaunchSettings,
  msUntilScheduledTime,
  shouldAutoLaunchNow,
} from './lib/demoHomeView'
import { openLaunchpadTab } from './lib/launchpadWindow'

const AUTO_LAUNCH_KEY = 'arcana-autolaunched-home'

function tryAutoLaunch() {
  // Skip during walkthrough / Figma capture deep-links
  if (new URLSearchParams(window.location.search).has('demo')) return
  if (getDemoScenario() !== 'returning') return
  const settings = getAutoLaunchSettings()
  if (settings.mode === 'off') return

  const launch = () => {
    try {
      if (sessionStorage.getItem(AUTO_LAUNCH_KEY) === '1') return
      sessionStorage.setItem(AUTO_LAUNCH_KEY, '1')
    } catch {
      /* ignore */
    }
    openLaunchpadTab()
  }

  if (settings.mode === 'on-arcana') {
    launch()
    return
  }

  if (shouldAutoLaunchNow(settings)) {
    launch()
    return
  }

  const delay = msUntilScheduledTime(settings.time)
  const timer = window.setTimeout(launch, delay)
  return () => window.clearTimeout(timer)
}

function ArcanaShell() {
  useEffect(() => {
    return tryAutoLaunch()
  }, [])

  return (
    <div className="relative flex h-full flex-col bg-bg text-text">
      <TopBar />
      <FactorDashboardsPage />
      <ScenarioFab />
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()

  if (location.pathname === '/launchpad') {
    return (
      <div className="h-full bg-bg text-text">
        <LaunchpadPage />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/*" element={<ArcanaShell />} />
    </Routes>
  )
}

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <AppRoutes />
    </BrowserRouter>
  )
}
