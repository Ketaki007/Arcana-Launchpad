import {
  RETURNING_DEMO_VIEWS,
  type ReturningDemoViewKey,
  returningViewIdForKey,
} from '../data/launchpadModel'

const HOME_KEY = 'arcana-home-view'
const AUTO_LAUNCH_KEY = 'arcana-auto-launch'

/** Default home for the returning demo. */
export const DEFAULT_HOME_VIEW_KEY: ReturningDemoViewKey = 'us-equities'

export type AutoLaunchMode = 'off' | 'on-arcana' | 'scheduled'

export type AutoLaunchSettings = {
  mode: AutoLaunchMode
  /** Local time HH:mm when mode is scheduled */
  time: string
  viewId: string | null
}

const DEFAULT_AUTO_LAUNCH: AutoLaunchSettings = {
  mode: 'on-arcana',
  time: '09:00',
  viewId: null,
}

export function getHomeViewId(): string {
  try {
    const value = localStorage.getItem(HOME_KEY)
    if (value) return value
  } catch {
    /* ignore */
  }
  return returningViewIdForKey(DEFAULT_HOME_VIEW_KEY)
}

export function setHomeViewId(viewId: string) {
  try {
    localStorage.setItem(HOME_KEY, viewId)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent('arcana-home-view', { detail: viewId }),
  )
}

export function homeViewKeyFromId(viewId: string): ReturningDemoViewKey | null {
  for (const view of RETURNING_DEMO_VIEWS) {
    if (returningViewIdForKey(view.key) === viewId) return view.key
  }
  return null
}

export function getHomeViewKey(): ReturningDemoViewKey {
  return homeViewKeyFromId(getHomeViewId()) ?? DEFAULT_HOME_VIEW_KEY
}

export function homeViewName(viewId: string): string | null {
  const key = homeViewKeyFromId(viewId)
  if (key) {
    return RETURNING_DEMO_VIEWS.find((v) => v.key === key)?.name ?? null
  }
  return null
}

export function getAutoLaunchSettings(): AutoLaunchSettings {
  try {
    const raw = localStorage.getItem(AUTO_LAUNCH_KEY)
    if (!raw) return { ...DEFAULT_AUTO_LAUNCH, viewId: getHomeViewId() }
    const parsed = JSON.parse(raw) as Partial<AutoLaunchSettings>
    return {
      mode:
        parsed.mode === 'off' ||
        parsed.mode === 'on-arcana' ||
        parsed.mode === 'scheduled'
          ? parsed.mode
          : DEFAULT_AUTO_LAUNCH.mode,
      time:
        typeof parsed.time === 'string' && /^\d{2}:\d{2}$/.test(parsed.time)
          ? parsed.time
          : DEFAULT_AUTO_LAUNCH.time,
      viewId:
        typeof parsed.viewId === 'string' ? parsed.viewId : getHomeViewId(),
    }
  } catch {
    return { ...DEFAULT_AUTO_LAUNCH, viewId: getHomeViewId() }
  }
}

export function setAutoLaunchSettings(settings: AutoLaunchSettings) {
  try {
    localStorage.setItem(AUTO_LAUNCH_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent('arcana-auto-launch', { detail: settings }),
  )
}

/** Minutes from midnight for HH:mm */
function minutesFromMidnight(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/**
 * Whether Launchpad should auto-open now for the given settings.
 * - on-arcana: yes (caller gates once per session)
 * - scheduled: yes if local time is at/after the scheduled time today
 * - off: never
 */
export function shouldAutoLaunchNow(settings: AutoLaunchSettings): boolean {
  if (settings.mode === 'off') return false
  if (settings.mode === 'on-arcana') return true
  const now = new Date()
  const current =
    now.getHours() * 60 + now.getMinutes()
  return current >= minutesFromMidnight(settings.time)
}

/** ms until next scheduled local time (today if still ahead, else tomorrow). */
export function msUntilScheduledTime(hhmm: string): number {
  const now = new Date()
  const target = new Date(now)
  const [h, m] = hhmm.split(':').map(Number)
  target.setHours(h ?? 9, m ?? 0, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}
