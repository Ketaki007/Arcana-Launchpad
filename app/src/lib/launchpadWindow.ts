import type {
  LaunchpadScenario,
  ReturningDemoViewKey,
} from '../data/launchpadModel'
import { getDemoScenario } from './demoScenario'
import { getHomeViewId, getHomeViewKey, homeViewKeyFromId } from './demoHomeView'

const LAUNCHPAD_TAB_NAME = 'arcana-launchpad'

let launchpadTab: Window | null = null

export type OpenLaunchpadOptions = {
  scenario?: LaunchpadScenario
  /** Open a specific saved demo view (returning scenario). */
  viewKey?: ReturningDemoViewKey
  /** Open by stable/custom view id. */
  viewId?: string
  /** Open on a blank new view draft. */
  createNew?: boolean
  /** Target display for multi-screen open (separate window name). */
  screen?: 1 | 2
}

const screenTabs: Partial<Record<1 | 2, Window | null>> = {}

export function openLaunchpadTab(
  options: OpenLaunchpadOptions | LaunchpadScenario = {},
): Window | null {
  const opts: OpenLaunchpadOptions =
    typeof options === 'string' ? { scenario: options } : options

  const scenario = opts.scenario ?? getDemoScenario()
  const params = new URLSearchParams({ scenario })

  if (opts.createNew) {
    params.set('new', '1')
  } else if (opts.viewKey) {
    params.set('view', opts.viewKey)
  } else if (opts.viewId) {
    const key = homeViewKeyFromId(opts.viewId)
    if (key) params.set('view', key)
    else params.set('viewId', opts.viewId)
  } else if (scenario === 'returning') {
    // Plain Launchpad click → open the home view
    params.set('view', getHomeViewKey())
  }

  if (opts.screen) {
    params.set('screen', String(opts.screen))
  }

  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const url = `${base}/launchpad?${params.toString()}`
  const tabName = opts.screen
    ? `${LAUNCHPAD_TAB_NAME}-screen-${opts.screen}`
    : LAUNCHPAD_TAB_NAME

  if (opts.screen) {
    const existing = screenTabs[opts.screen]
    if (existing && !existing.closed) {
      existing.location.href = url
      existing.focus()
      return existing
    }
    const win = window.open(url, tabName)
    screenTabs[opts.screen] = win
    win?.focus()
    return win
  }

  if (launchpadTab && !launchpadTab.closed) {
    launchpadTab.location.href = url
    launchpadTab.focus()
    return launchpadTab
  }

  const win = window.open(url, LAUNCHPAD_TAB_NAME)
  launchpadTab = win

  if (win) {
    win.focus()
  }

  return win
}

/** Open Launchpad on the current home view (returning scenario). */
export function openHomeLaunchpadTab(): Window | null {
  return openLaunchpadTab({
    scenario: 'returning',
    viewKey: getHomeViewKey(),
    viewId: getHomeViewId(),
  })
}
