import { useState } from 'react'
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

/** Demo scenario picker — centered on the Arcana landing. */
export function ScenarioFab() {
  const [scenario, setScenario] = useState<LaunchpadScenario>(() =>
    getDemoScenario(),
  )

  function selectScenario(next: LaunchpadScenario) {
    setScenario(next)
    setDemoScenario(next)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        role="region"
        aria-label="Demo scenarios"
        className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-[2px] border border-border bg-panel py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
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
    </div>
  )
}
