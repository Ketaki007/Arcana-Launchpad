import { useEffect, useRef, useState } from 'react'
import { Settings } from 'lucide-react'
import type { LaunchpadScenario } from '../data/launchpadModel'
import { getDemoScenario, setDemoScenario } from '../lib/demoScenario'

const OPTIONS: {
  value: LaunchpadScenario
  label: string
  description: string
}[] = [
  {
    value: 'first-time',
    label: 'Creating a view for the first time',
    description: 'Empty Launchpad — name a view or start from a template',
  },
  {
    value: 'returning',
    label: 'Views already exist',
    description: 'Returning user with saved US Equities, Daily Start & Commodity',
  },
]

/** Demo scenario picker — floating gear on the Arcana landing. Sets variant only. */
export function ScenarioFab() {
  const [open, setOpen] = useState(false)
  const [scenario, setScenario] = useState<LaunchpadScenario>(() =>
    getDemoScenario(),
  )
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function selectScenario(next: LaunchpadScenario) {
    setScenario(next)
    setDemoScenario(next)
  }

  return (
    <div ref={rootRef} className="fixed bottom-4 right-4 z-50">
      {open && (
        <div
          role="dialog"
          aria-label="Demo scenarios"
          className="absolute bottom-12 right-0 w-72 overflow-hidden rounded-[2px] border border-border bg-panel py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Demo scenarios
          </div>
          <fieldset className="m-0 border-0 p-0">
            <legend className="sr-only">Select demo scenario</legend>
            {OPTIONS.map((option) => {
              const selected = scenario === option.value
              return (
                <label
                  key={option.value}
                  className={`flex w-full cursor-pointer items-start gap-2.5 px-3 py-2 text-left hover:bg-white/[0.04] ${
                    selected ? 'bg-selection-muted' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="demo-scenario"
                    value={option.value}
                    checked={selected}
                    onChange={() => selectScenario(option.value)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-selection)]"
                  />
                  <span>
                    <span className="block text-[12px] text-text">
                      {option.label}
                    </span>
                    <span className="block text-[11px] text-text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              )
            })}
          </fieldset>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-panel text-text-secondary shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:border-selection/50 hover:text-text"
        aria-label="Demo scenarios"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Settings size={18} strokeWidth={1.75} />
      </button>
    </div>
  )
}
