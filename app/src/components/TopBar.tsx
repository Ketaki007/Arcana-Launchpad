import { useEffect, useRef, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import {
  Search,
  Crosshair,
  LineChart,
  LayoutGrid,
  Settings,
  User,
  Plus,
  PanelsTopLeft,
  SquareArrowOutUpRight,
  Home,
  Monitor,
} from 'lucide-react'
import { openLaunchpadTab } from '../lib/launchpadWindow'
import { getDemoScenario, setDemoScenario } from '../lib/demoScenario'
import { getHomeViewId } from '../lib/demoHomeView'
import {
  RETURNING_DEMO_VIEWS,
  returningViewIdForKey,
  type LaunchpadScenario,
  type ReturningDemoViewKey,
} from '../data/launchpadModel'

type ViewContextMenu = {
  viewKey: ReturningDemoViewKey
  viewName: string
  x: number
  y: number
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center gap-1.5 h-7 px-2 text-[12px] text-text-secondary hover:text-text transition-colors',
    isActive ? 'text-text border-b-2 border-text' : 'border-b-2 border-transparent',
  ].join(' ')

export function TopBar() {
  const [searchParams] = useSearchParams()
  /** Walkthrough / Figma: launchpad-menu = Launchpad hover menu open */
  const demo = searchParams.get('demo')
  const scenarioParam = searchParams.get('scenario')
  const forceLaunchpadMenu = demo === 'launchpad-menu'
  /** Hide discovery cue during scripted Figma captures */
  const suppressHint = Boolean(demo)

  const [scenario, setScenario] = useState<LaunchpadScenario>(() => {
    if (scenarioParam === 'returning' || scenarioParam === 'first-time') {
      return scenarioParam
    }
    return getDemoScenario()
  })
  const [homeViewId, setHomeViewIdState] = useState(() => getHomeViewId())
  const [menuOpen, setMenuOpen] = useState(forceLaunchpadMenu)
  const [contextMenu, setContextMenu] = useState<ViewContextMenu | null>(null)
  /** Session-only: returns on every reload; dismisses on hover/click until then */
  const [showLaunchpadHint, setShowLaunchpadHint] = useState(!suppressHint)
  const closeTimer = useRef<number | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const showViewsMenu = scenario === 'returning' || forceLaunchpadMenu

  function dismissLaunchpadHint() {
    if (!showLaunchpadHint) return
    setShowLaunchpadHint(false)
  }

  useEffect(() => {
    if (scenarioParam === 'returning' || scenarioParam === 'first-time') {
      setScenario(scenarioParam)
      setDemoScenario(scenarioParam)
    }
  }, [scenarioParam])

  useEffect(() => {
    if (forceLaunchpadMenu) setMenuOpen(true)
  }, [forceLaunchpadMenu])

  useEffect(() => {
    function onScenario(e: Event) {
      const detail = (e as CustomEvent<LaunchpadScenario>).detail
      if (detail === 'returning' || detail === 'first-time') {
        setScenario(detail)
      }
    }
    function onHome(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      if (typeof detail === 'string') setHomeViewIdState(detail)
    }
    function onStorage(e: StorageEvent) {
      if (e.key === 'arcana-demo-scenario') setScenario(getDemoScenario())
      if (e.key === 'arcana-home-view') setHomeViewIdState(getHomeViewId())
    }
    window.addEventListener('arcana-demo-scenario', onScenario)
    window.addEventListener('arcana-home-view', onHome)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('arcana-demo-scenario', onScenario)
      window.removeEventListener('arcana-home-view', onHome)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  function clearCloseTimer() {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  function openMenu() {
    if (!showViewsMenu) return
    clearCloseTimer()
    setMenuOpen(true)
  }

  function scheduleCloseMenu() {
    if (contextMenu || forceLaunchpadMenu) return
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => {
      setMenuOpen(false)
      closeTimer.current = null
    }, 120)
  }

  function openView(viewKey: ReturningDemoViewKey) {
    clearCloseTimer()
    setContextMenu(null)
    setMenuOpen(false)
    openLaunchpadTab({ scenario: 'returning', viewKey })
  }

  function openViewOnScreen(viewKey: ReturningDemoViewKey, screen: 1 | 2) {
    clearCloseTimer()
    setContextMenu(null)
    setMenuOpen(false)
    openLaunchpadTab({ scenario: 'returning', viewKey, screen })
  }

  function openCreateNew() {
    clearCloseTimer()
    setContextMenu(null)
    setMenuOpen(false)
    openLaunchpadTab({ scenario: 'returning', createNew: true })
  }

  useEffect(() => {
    if (!contextMenu) return
    function onPointerDown(e: PointerEvent) {
      if (contextMenuRef.current?.contains(e.target as Node)) return
      setContextMenu(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setContextMenu(null)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [contextMenu])

  return (
    <header className="flex h-10 shrink-0 items-center gap-3 border-b border-border bg-bg-elevated px-3">
      <div className="flex shrink-0 items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-[2px] bg-text text-[13px] font-semibold text-bg"
          aria-label="Arcana"
        >
          A
        </div>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 rounded-[2px] bg-accent px-2.5 text-[12px] font-medium text-black hover:bg-accent-hover"
        >
          <LayoutGrid size={12} strokeWidth={2} />
          My Dashboard
        </button>
      </div>

      <div className="relative max-w-xl flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          placeholder="Search for assets, indices, and more"
          className="h-7 w-full rounded-[2px] border border-border bg-panel pl-8 pr-3 text-[12px] text-text outline-none placeholder:text-text-muted focus:border-selection"
        />
      </div>

      <nav className="ml-auto flex items-center gap-0.5">
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 px-2 text-[12px] text-text-secondary hover:text-text"
        >
          <Crosshair size={14} strokeWidth={1.75} />
          Risk Model
        </button>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 px-2 text-[12px] text-text-secondary hover:text-text"
        >
          <LineChart size={14} strokeWidth={1.75} />
          Charts
        </button>
        <NavLink to="/" className={navLinkClass} end>
          <LayoutGrid size={14} strokeWidth={1.75} />
          Factor Dashboards
        </NavLink>

        <div
          className="relative"
          onMouseEnter={() => {
            dismissLaunchpadHint()
            openMenu()
          }}
          onMouseLeave={scheduleCloseMenu}
        >
          <button
            type="button"
            onClick={() => {
              dismissLaunchpadHint()
              openLaunchpadTab()
            }}
            className="inline-flex h-7 items-center gap-1.5 border-b-2 border-transparent px-2 text-[12px] text-text-secondary transition-colors hover:text-text"
            aria-haspopup={showViewsMenu ? 'menu' : undefined}
            aria-expanded={showViewsMenu ? menuOpen : undefined}
          >
            <PanelsTopLeft size={14} strokeWidth={1.75} />
            Launchpad
            <SquareArrowOutUpRight
              size={12}
              strokeWidth={1.75}
              className="text-text-muted"
            />
          </button>

          {showLaunchpadHint ? (
            <div
              className="launchpad-hint pointer-events-none absolute left-1/2 top-full z-40 mt-1 -translate-x-1/2"
              aria-hidden
            >
              {/* Single continuous path so head + shaft stay connected */}
              <svg
                width="28"
                height="88"
                viewBox="0 0 28 88"
                fill="none"
                className="text-[#d946ef] drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]"
              >
                <path
                  d="M14 86 L14 18 M5 34 L14 12 L23 34"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : null}

          {showViewsMenu && menuOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full z-50 mt-0 w-56 rounded-[2px] border border-border bg-panel py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            >
              <div className="absolute -top-1 left-0 right-0 h-1" aria-hidden />
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Saved views
              </div>
              {RETURNING_DEMO_VIEWS.map((view) => {
                const isHome =
                  returningViewIdForKey(view.key) === homeViewId
                return (
                  <button
                    key={view.key}
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[12px] text-text hover:bg-white/[0.04]"
                    onClick={() => openView(view.key)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearCloseTimer()
                      setMenuOpen(true)
                      setContextMenu({
                        viewKey: view.key,
                        viewName: view.name,
                        x: e.clientX,
                        y: e.clientY,
                      })
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{view.name}</span>
                    {isHome ? (
                      <Home size={12} className="shrink-0 text-selection" />
                    ) : null}
                  </button>
                )
              })}
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[12px] text-text-secondary hover:bg-white/[0.04] hover:text-text"
                onClick={openCreateNew}
              >
                <Plus size={12} strokeWidth={2} />
                Create new
              </button>
            </div>
          )}

          {contextMenu ? (
            <div
              ref={contextMenuRef}
              role="menu"
              aria-label={`Open ${contextMenu.viewName}`}
              className="fixed z-[60] min-w-[168px] rounded-[2px] border border-border bg-panel py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseEnter={clearCloseTimer}
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] text-text-secondary hover:bg-white/[0.04] hover:text-text"
                onClick={() => openViewOnScreen(contextMenu.viewKey, 1)}
              >
                <Monitor size={12} className="shrink-0" />
                Open in screen 1
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] text-text-secondary hover:bg-white/[0.04] hover:text-text"
                onClick={() => openViewOnScreen(contextMenu.viewKey, 2)}
              >
                <Monitor size={12} className="shrink-0" />
                Open in screen 2
              </button>
            </div>
          ) : null}
        </div>

        <div className="mx-1 h-4 w-px bg-border" />

        <button
          type="button"
          className="inline-flex h-7 items-center gap-1 px-2 text-[12px] text-text-secondary hover:text-text"
        >
          <Plus size={12} strokeWidth={2} />
          Create Table
        </button>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1 px-2 text-[12px] text-text-secondary hover:text-text"
        >
          <Plus size={12} strokeWidth={2} />
          Create Chart
        </button>

        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center text-text-secondary hover:text-text"
          aria-label="Settings"
        >
          <Settings size={14} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center text-text-secondary hover:text-text"
          aria-label="Account"
        >
          <User size={14} strokeWidth={1.75} />
        </button>
      </nav>
    </header>
  )
}
