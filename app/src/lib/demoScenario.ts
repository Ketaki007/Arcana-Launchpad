import type { LaunchpadScenario } from '../data/launchpadModel'

const STORAGE_KEY = 'arcana-demo-scenario'

export function getDemoScenario(): LaunchpadScenario {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'returning' || value === 'first-time') return value
  } catch {
    /* ignore */
  }
  return 'first-time'
}

export function setDemoScenario(scenario: LaunchpadScenario) {
  try {
    localStorage.setItem(STORAGE_KEY, scenario)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent('arcana-demo-scenario', { detail: scenario }),
  )
}
