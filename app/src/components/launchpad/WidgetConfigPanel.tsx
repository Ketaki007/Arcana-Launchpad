import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { PlacedWidget } from '../../data/launchpadModel'
import { defaultConfigFor } from '../../data/launchpadModel'
import {
  DEFAULT_CLOCK_CITIES,
  WORLD_CLOCKS,
  parseClockCities,
  type WorldClockCity,
} from '../../data/market'
import { OpaqueSelect } from '../ui/OpaqueSelect'

export const CONFIGURABLE_WIDGET_IDS = new Set([
  'chart',
  'international-clock',
])

type Props = {
  widget: PlacedWidget
  anchorEl: HTMLElement | null
  onClose: () => void
  onChange: (key: string, value: string) => void
  onReset: () => void
}

/** Compact configure popup anchored to the widget header control. */
export function WidgetConfigMenu({
  widget,
  anchorEl,
  onClose,
  onChange,
  onReset,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!anchorEl) return
    function place() {
      if (!anchorEl) return
      const r = anchorEl.getBoundingClientRect()
      const width = 260
      const left = Math.min(
        Math.max(8, r.right - width),
        window.innerWidth - width - 8,
      )
      setPos({ top: r.bottom + 4, left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchorEl])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (anchorEl?.contains(t)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, anchorEl])

  if (!pos) return null

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-label={`Configure ${widget.name}`}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-[80] w-[260px] rounded-[2px] border border-selection bg-panel shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="flex items-center gap-2 border-b border-border-subtle px-2.5 py-1.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-semibold text-text">
            Configure
          </div>
          <div className="truncate text-[10px] text-text-muted">{widget.name}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text"
          aria-label="Close configuration"
        >
          <X size={13} />
        </button>
      </header>

      <div className="max-h-[300px] space-y-3 overflow-auto p-2.5">
        {widget.id === 'chart' ? (
          <ChartConfigFields widget={widget} onChange={onChange} />
        ) : widget.id === 'international-clock' ? (
          <ClockConfigFields widget={widget} onChange={onChange} />
        ) : (
          <div className="text-[11px] text-text-muted">
            No configuration for this widget.
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle p-2">
        <button
          type="button"
          onClick={() => {
            const defaults = defaultConfigFor(widget.id)
            for (const [key, value] of Object.entries(defaults)) {
              onChange(key, value)
            }
            onReset()
            onClose()
          }}
          className="h-7 w-full rounded-[2px] border border-border text-[11px] text-text-secondary hover:text-text"
        >
          Reset to default
        </button>
      </div>
    </div>,
    document.body,
  )
}

function ChartConfigFields({
  widget,
  onChange,
}: {
  widget: PlacedWidget
  onChange: (key: string, value: string) => void
}) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-0.5 block text-[11px] text-text-secondary">
          Chart type
        </span>
        <OpaqueSelect
          className="w-full"
          triggerClassName="h-7 w-full justify-between px-2 text-[12px]"
          aria-label="Chart type"
          value={widget.config.style ?? 'Line'}
          onChange={(next) => onChange('style', next)}
          options={['Line', 'Candle', 'Area'].map((opt) => ({
            value: opt,
            label: opt,
          }))}
        />
      </label>
      <label className="block">
        <span className="mb-0.5 block text-[11px] text-text-secondary">
          Compare with
        </span>
        <OpaqueSelect
          className="w-full"
          triggerClassName="h-7 w-full justify-between px-2 text-[12px]"
          aria-label="Compare with"
          value={widget.config.compare || 'None'}
          onChange={(next) => onChange('compare', next)}
          options={['None', 'SPX', 'AMD', 'AAPL', 'MSFT', 'TSLA'].map(
            (opt) => ({
              value: opt,
              label: opt,
            }),
          )}
        />
      </label>
    </div>
  )
}

function ClockConfigFields({
  widget,
  onChange,
}: {
  widget: PlacedWidget
  onChange: (key: string, value: string) => void
}) {
  const [query, setQuery] = useState('')
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selected = parseClockCities(widget.config.cities)
  const selectedNames = useMemo(
    () => new Set(selected.map((c) => c.city)),
    [selected],
  )

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    return WORLD_CLOCKS.filter((c) => {
      if (selectedNames.has(c.city)) return false
      if (!q) return true
      return (
        c.city.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      )
    })
  }, [query, selectedNames])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, suggestions.length])

  function commitCities(cities: WorldClockCity[]) {
    if (cities.length === 0) return
    onChange('cities', cities.map((c) => c.city).join(','))
  }

  function addCity(city: WorldClockCity) {
    if (selectedNames.has(city.city)) return
    commitCities([...selected, city])
    setQuery('')
    setSuggestOpen(true)
    inputRef.current?.focus()
  }

  function removeCity(city: string) {
    if (selected.length <= 1) return
    commitCities(selected.filter((c) => c.city !== city))
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] text-text-secondary">Cities</span>
        <button
          type="button"
          onClick={() => {
            onChange('cities', DEFAULT_CLOCK_CITIES.join(','))
            setQuery('')
          }}
          className="text-[10px] text-selection hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Figma-style invite: chips + search */}
      <div
        className="rounded-[2px] border border-border bg-bg focus-within:border-selection"
        onMouseDown={(e) => {
          // Keep focus on the search field when clicking chips area
          if ((e.target as HTMLElement).closest('button')) return
          inputRef.current?.focus()
        }}
      >
        <div className="flex max-h-28 flex-wrap content-start gap-1 p-1.5">
          {selected.map((city) => (
            <span
              key={city.city}
              className="inline-flex h-5 max-w-full items-center gap-1 rounded-[2px] bg-selection/20 pl-1.5 pr-0.5 text-[11px] text-text"
            >
              <span className="truncate">{city.city}</span>
              <button
                type="button"
                title={`Remove ${city.city}`}
                aria-label={`Remove ${city.city}`}
                disabled={selected.length <= 1}
                onClick={() => removeCity(city.city)}
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] text-text-muted hover:bg-white/10 hover:text-text disabled:opacity-30"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder={
              selected.length === 0 ? 'Search cities…' : 'Add city…'
            }
            className="h-5 min-w-[88px] flex-1 bg-transparent px-1 text-[11px] text-text outline-none placeholder:text-text-muted"
            onFocus={() => setSuggestOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value)
              setSuggestOpen(true)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSuggestOpen(true)
                setActiveIndex((i) =>
                  Math.min(i + 1, Math.max(suggestions.length - 1, 0)),
                )
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActiveIndex((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                const pick = suggestions[activeIndex]
                if (pick) addCity(pick)
              } else if (e.key === 'Backspace' && !query && selected.length > 1) {
                removeCity(selected[selected.length - 1]!.city)
              } else if (e.key === 'Escape') {
                setSuggestOpen(false)
                setQuery('')
              }
            }}
            onBlur={() => {
              // Delay so suggestion click can register
              window.setTimeout(() => setSuggestOpen(false), 120)
            }}
          />
        </div>
      </div>

      {suggestOpen && suggestions.length > 0 ? (
        <ul
          role="listbox"
          className="mt-1 max-h-40 overflow-auto rounded-[2px] border border-border bg-panel py-0.5 shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
        >
          {suggestions.map((city, index) => (
            <li key={city.city} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addCity(city)}
                onMouseEnter={() => setActiveIndex(index)}
                className={[
                  'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px]',
                  index === activeIndex
                    ? 'bg-selection text-white'
                    : 'text-text hover:bg-white/[0.05]',
                ].join(' ')}
              >
                <span className="min-w-0 flex-1 truncate font-medium">
                  {city.city}
                </span>
                <span
                  className={[
                    'shrink-0 text-[10px]',
                    index === activeIndex ? 'text-white/70' : 'text-text-muted',
                  ].join(' ')}
                >
                  {city.region}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : suggestOpen && query.trim() ? (
        <div className="mt-1 px-1 py-2 text-[10px] text-text-muted">
          No matching cities
        </div>
      ) : null}

      <p className="mt-1.5 text-[10px] text-text-muted">
        Search and add cities. Remove with × or Backspace.
      </p>
    </div>
  )
}

/** @deprecated Use WidgetConfigMenu */
export const WidgetConfigPanel = WidgetConfigMenu
