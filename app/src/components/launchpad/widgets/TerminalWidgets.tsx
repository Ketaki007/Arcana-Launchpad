import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type ReactNode,
} from 'react'
import { ChevronDown, Search } from 'lucide-react'
import {
  NEWS_FEED_ITEMS,
  NEWS_FEED_SOURCES,
  graphicDashboardTiles,
  WORLD_EQUITY_REGIONS,
  parseClockCities,
  getSecurity,
  type DashboardTile,
  type EquityIndexRow,
  type NewsFeedDay,
} from '../../../data/market'
import { setResearchDragData } from '../../../lib/researchDnD'
import { OpaqueSelect } from '../../ui/OpaqueSelect'

const HEADLINE = 'text-[#e8873a]'
/** Fixed column widths so filter headers align with list cells. */
const COL_SOURCE = 'w-12'
const COL_TIME = 'w-12'

function MiniSpark({
  series,
  kind = 'line',
  tone = 'neutral',
}: {
  series: number[]
  kind?: 'line' | 'bars' | 'dual'
  tone?: DashboardTile['tone']
}) {
  const w = 120
  const h = 28
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const stroke =
    tone === 'neg' ? '#ef4444' : tone === 'pos' ? '#22c55e' : '#60a5fa'

  if (kind === 'bars') {
    const barW = w / series.length - 2
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-7 w-full">
        {series.map((v, i) => {
          const bh = ((v - min) / span) * (h - 2)
          return (
            <rect
              key={i}
              x={i * (barW + 2)}
              y={h - bh}
              width={barW}
              height={bh}
              fill={stroke}
              opacity={0.85}
            />
          )
        })}
      </svg>
    )
  }

  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w
      const y = h - ((v - min) / span) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-7 w-full">
      {kind === 'line' ? (
        <>
          <polyline
            fill="none"
            stroke={stroke}
            strokeWidth={1.25}
            points={pts}
          />
          <polyline
            fill={`${stroke}22`}
            stroke="none"
            points={`0,${h} ${pts} ${w},${h}`}
          />
        </>
      ) : (
        <>
          <polyline
            fill="none"
            stroke="#94a3b8"
            strokeWidth={1}
            points={pts}
          />
          <polyline
            fill="none"
            stroke={stroke}
            strokeWidth={1.25}
            points={series
              .map((v, i) => {
                const x = (i / (series.length - 1)) * w
                const y = h - ((v - min) / span) * (h - 8) - 4
                return `${x},${y}`
              })
              .join(' ')}
          />
        </>
      )}
    </svg>
  )
}

type DateFilter = 'all' | NewsFeedDay
type TimeSort = 'newest' | 'oldest'

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All Dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last Week' },
]

const TIME_OPTIONS: { value: TimeSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

function matchesDay(itemDay: NewsFeedDay, filter: DateFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'today') return itemDay === 'today'
  if (filter === 'yesterday')
    return itemDay === 'today' || itemDay === 'yesterday'
  // Last week includes everything in the demo set
  return true
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Dense Bloomberg-style news wire with editable keyword filter chips. */
export function NewsFeedWidget({ ticker }: { ticker: string }) {
  const [keywords, setKeywords] = useState<string[]>(() => [
    `${ticker} · S&P 500 Stock Market…`,
  ])
  const [draft, setDraft] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>(() =>
    NEWS_FEED_SOURCES.map((s) => s.code),
  )
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [timeSort, setTimeSort] = useState<TimeSort>('newest')

  // Keep a ticker-scoped default chip when context security changes
  useEffect(() => {
    setKeywords((prev) => {
      if (prev.length === 0) return [`${ticker} · S&P 500 Stock Market…`]
      const next = [...prev]
      const seeded = next.findIndex((k) => /· S&P 500/.test(k) || /^[A-Z]{1,5}\b/.test(k))
      if (seeded >= 0 && next[seeded]?.includes('·')) {
        next[seeded] = `${ticker} · S&P 500 Stock Market…`
        return next
      }
      return prev
    })
  }, [ticker])

  function addKeyword(raw: string) {
    const value = raw.trim()
    if (!value) return
    setKeywords((prev) =>
      prev.some((k) => k.toLowerCase() === value.toLowerCase())
        ? prev
        : [...prev, value],
    )
    setDraft('')
  }

  function removeKeyword(index: number) {
    setKeywords((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
      setEditValue('')
    }
  }

  function commitEdit() {
    if (editingIndex == null) return
    const value = editValue.trim()
    if (!value) {
      removeKeyword(editingIndex)
    } else {
      setKeywords((prev) =>
        prev.map((k, i) => (i === editingIndex ? value : k)),
      )
    }
    setEditingIndex(null)
    setEditValue('')
  }

  function toggleSource(code: string) {
    setSelectedSources((prev) => {
      if (prev.includes(code)) {
        // Keep at least one source selected
        if (prev.length === 1) return prev
        return prev.filter((c) => c !== code)
      }
      return [...prev, code]
    })
  }

  const rows = useMemo(() => {
    const keywordFiltered =
      keywords.length === 0
        ? NEWS_FEED_ITEMS
        : NEWS_FEED_ITEMS.filter((n) => {
            const hay = n.headline.toLowerCase()
            return keywords.some((k) => {
              const needle = k.toLowerCase()
              if (hay.includes(needle)) return true
              return needle
                .split(/[^a-z0-9]+/i)
                .filter((t) => t.length >= 3)
                .some((t) => hay.includes(t))
            })
          })

    const base = keywordFiltered.length > 0 ? keywordFiltered : NEWS_FEED_ITEMS

    const filtered = base.filter(
      (n) =>
        selectedSources.includes(n.source) && matchesDay(n.day, dateFilter),
    )

    const sorted = [...filtered].sort((a, b) => {
      const diff = timeToMinutes(b.time) - timeToMinutes(a.time)
      return timeSort === 'newest' ? diff : -diff
    })

    return sorted
  }, [keywords, selectedSources, dateFilter, timeSort])

  const sourceLabel =
    selectedSources.length === NEWS_FEED_SOURCES.length
      ? 'Sources'
      : selectedSources.length === 1
        ? selectedSources[0]
        : `${selectedSources.length} src`
  const dateLabel =
    DATE_OPTIONS.find((o) => o.value === dateFilter)?.label ?? 'All Dates'
  const timeLabel =
    TIME_OPTIONS.find((o) => o.value === timeSort)?.label ?? 'Time'

  return (
    <div className="flex h-full min-h-0 flex-col text-[12px]">
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border-subtle px-1.5 py-1">
        <button
          type="button"
          className="h-6 rounded-[2px] bg-white/[0.06] px-2 text-[11px] text-text hover:bg-white/[0.1]"
        >
          Create Feed
        </button>
        <button
          type="button"
          className="h-6 rounded-[2px] bg-white/[0.06] px-2 text-[11px] text-text hover:bg-white/[0.1]"
        >
          Actions ▾
        </button>
        <button
          type="button"
          className="h-6 rounded-[2px] bg-white/[0.06] px-2 text-[11px] text-text hover:bg-white/[0.1]"
        >
          Open Search
        </button>
        <span className="ml-auto text-[11px] text-text-muted">Pg 1</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-b border-border-subtle px-2 py-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {keywords.map((keyword, index) =>
            editingIndex === index ? (
              <input
                key={`edit-${index}`}
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitEdit()
                  }
                  if (e.key === 'Escape') {
                    setEditingIndex(null)
                    setEditValue('')
                  }
                }}
                className="h-5 min-w-[100px] max-w-[220px] rounded-[2px] border border-[#e8873a] bg-bg px-1.5 text-[11px] text-[#e8873a] outline-none"
              />
            ) : (
              <span
                key={`${keyword}-${index}`}
                className={`inline-flex max-w-[220px] items-center gap-1 truncate rounded-[2px] border border-[#e8873a]/60 px-1.5 py-0.5 text-[11px] ${HEADLINE}`}
              >
                <button
                  type="button"
                  title="Edit keyword"
                  onClick={() => {
                    setEditingIndex(index)
                    setEditValue(keyword)
                  }}
                  className="min-w-0 truncate text-left hover:underline"
                >
                  {keyword}
                </button>
                <button
                  type="button"
                  title="Remove keyword"
                  aria-label={`Remove ${keyword}`}
                  onClick={() => removeKeyword(index)}
                  className="shrink-0 text-text-muted hover:text-text"
                >
                  ×
                </button>
              </span>
            ),
          )}

          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addKeyword(draft)
              }
              if (e.key === 'Backspace' && !draft && keywords.length > 0) {
                removeKeyword(keywords.length - 1)
              }
            }}
            placeholder="+ keyword"
            className="h-5 min-w-[72px] flex-1 basis-[72px] rounded-[2px] border border-transparent bg-transparent px-1 text-[11px] text-text outline-none placeholder:text-text-muted focus:border-border-subtle"
          />

          <NewsFilterMenu
            label={dateLabel}
            title="Filter by date"
            align="right"
            className="ml-1 w-auto shrink-0"
            active={dateFilter !== 'all'}
          >
            {DATE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={dateFilter === o.value}
                onClick={() => setDateFilter(o.value)}
                className={[
                  'flex w-full items-center px-2.5 py-1.5 text-left text-[11px] hover:bg-panel-header',
                  dateFilter === o.value ? HEADLINE : 'text-text',
                ].join(' ')}
              >
                {o.label}
              </button>
            ))}
          </NewsFilterMenu>
        </div>

        {/* Sources + Time: same widths/gaps as list columns */}
        <div className="flex shrink-0 items-center gap-2">
          <NewsFilterMenu
            label={sourceLabel}
            title="Filter sources"
            align="right"
            className={COL_SOURCE}
            active={selectedSources.length < NEWS_FEED_SOURCES.length}
          >
            {NEWS_FEED_SOURCES.map((s) => (
              <label
                key={s.code}
                className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-[11px] text-text hover:bg-panel-header"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(s.code)}
                  onChange={() => toggleSource(s.code)}
                  className="accent-[#e8873a]"
                />
                <span className={`w-8 font-medium ${HEADLINE}`}>{s.code}</span>
                <span className="text-text-muted">{s.label}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={() =>
                setSelectedSources(NEWS_FEED_SOURCES.map((s) => s.code))
              }
              className="w-full border-t border-border-subtle px-2.5 py-1.5 text-left text-[11px] text-selection hover:bg-panel-header"
            >
              Select all
            </button>
          </NewsFilterMenu>

          <NewsFilterMenu
            label={timeLabel}
            title="Sort by time"
            align="right"
            className={COL_TIME}
            active={timeSort !== 'newest'}
          >
            {TIME_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="menuitemradio"
                aria-checked={timeSort === o.value}
                onClick={() => setTimeSort(o.value)}
                className={[
                  'flex w-full items-center px-2.5 py-1.5 text-left text-[11px] hover:bg-panel-header',
                  timeSort === o.value ? HEADLINE : 'text-text',
                ].join(' ')}
              >
                {o.label}
              </button>
            ))}
          </NewsFilterMenu>
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-auto">
        {rows.map((n) => (
          <li
            key={n.id}
            draggable
            title="Drag into Research Notes"
            onDragStart={(e) =>
              setResearchDragData(e, {
                kind: 'news',
                title: n.headline,
                detail: `${n.source} · ${n.time}`,
                source: 'News Feed',
              })
            }
            className="flex cursor-grab items-center gap-2 border-b border-border-subtle px-2 py-1 hover:bg-white/[0.03] active:cursor-grabbing"
          >
            <span className={`min-w-0 flex-1 truncate ${HEADLINE}`}>
              {n.headline}
            </span>
            <span
              className={[
                `${COL_SOURCE} shrink-0 text-right text-[11px] font-medium tabular-nums`,
                n.accent ? 'text-negative' : HEADLINE,
              ].join(' ')}
            >
              {n.source}
            </span>
            <span
              className={`${COL_TIME} shrink-0 text-right font-mono text-[11px] tabular-nums text-text-muted`}
            >
              {n.time}
            </span>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="px-2 py-3 text-[11px] text-text-muted">
            No stories match these filters.
          </li>
        ) : null}
      </ul>
    </div>
  )
}

function NewsFilterMenu({
  label,
  title,
  children,
  className = '',
  align = 'left',
  active = false,
}: {
  label: string
  title: string
  children: ReactNode
  className?: string
  align?: 'left' | 'right'
  active?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
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

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        title={title}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          'inline-flex h-5 w-full items-center justify-end gap-0.5 rounded-[2px] px-0.5 text-[11px] hover:bg-white/[0.05]',
          active ? HEADLINE : 'text-text-secondary',
        ].join(' ')}
      >
        <span className="truncate font-semibold">{label}</span>
        <ChevronDown size={10} className="shrink-0 opacity-70" />
      </button>
      {open ? (
        <div
          role="menu"
          className={[
            'absolute top-full z-[60] mt-0.5 min-w-[148px] rounded-[2px] border border-border bg-panel py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]',
            align === 'right' ? 'right-0' : 'left-0',
          ].join(' ')}
          onClick={(e) => {
            const t = e.target as HTMLElement
            if (t.closest('button[role="menuitemradio"]')) setOpen(false)
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

/** Metric tile grid with sparklines (GD). */
export function GraphicDashboardWidget({ ticker }: { ticker: string }) {
  const s = getSecurity(ticker)
  const tiles = graphicDashboardTiles(ticker)

  return (
    <div className="flex h-full min-h-0 flex-col text-[12px]">
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border-subtle px-2 py-1.5">
        <div className="min-w-0">
          <div className="truncate text-[12px] font-medium text-[#7dd3fc]">
            {s.name} (U.S.)
          </div>
          <div className={`truncate text-[11px] ${HEADLINE}`}>
            {s.name.split(' ')[0]} makes big bet on growth — BN
          </div>
        </div>
        <div className="shrink-0 text-[11px] text-text-muted">1/3</div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-5 gap-px overflow-auto bg-border-subtle">
        {tiles.map((tile) => {
          const valueClass =
            tile.tone === 'neg'
              ? 'text-negative'
              : tile.tone === 'pos'
                ? 'text-positive'
                : tile.tone === 'accent'
                  ? HEADLINE
                  : 'text-text'
          return (
            <div
              key={tile.id}
              className="flex min-h-[88px] flex-col bg-panel p-1.5"
            >
              <div className="text-[10px] text-text-muted">{tile.title}</div>
              {tile.kind === 'text' ? (
                <>
                  <div className="mt-1 text-[11px] text-text-secondary">
                    {tile.sub}
                  </div>
                  <div className={`mt-0.5 text-[14px] font-semibold ${valueClass}`}>
                    {tile.value}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`mt-0.5 font-mono text-[15px] font-semibold tabular-nums ${valueClass}`}
                  >
                    {tile.value}
                  </div>
                  {tile.sub ? (
                    <div className="text-[10px] text-text-muted">{tile.sub}</div>
                  ) : null}
                  {tile.series ? (
                    <MiniSpark
                      series={tile.series}
                      kind={tile.kind === 'bars' || tile.kind === 'dual' ? tile.kind : 'line'}
                      tone={tile.tone}
                    />
                  ) : null}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function fmtSigned(n: number, digits = 2) {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(digits)}`
}

const WEI_ORANGE_TRIGGER =
  'h-5 border-0 bg-[#e8873a] px-1.5 font-semibold text-black hover:border-0 hover:brightness-110'

function WeiSpark({ series }: { series: number[] }) {
  const w = 56
  const h = 16
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w
      const y = h - ((v - min) / span) * (h - 2) - 1
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-4 w-14">
      <polyline
        fill="none"
        stroke="#e8e8e8"
        strokeWidth={1.1}
        points={pts}
      />
    </svg>
  )
}

function PctChgBar({ value, maxAbs }: { value: number; maxAbs: number }) {
  const pct = maxAbs > 0 ? Math.min(Math.abs(value) / maxAbs, 1) : 0
  const width = `${Math.max(pct * 50, value === 0 ? 0 : 6)}%`
  const pos = value >= 0
  return (
    <div className="relative h-3.5 w-[4.5rem]">
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/25" />
      <div
        className={[
          'absolute top-0.5 h-2.5',
          pos ? 'left-1/2 bg-positive' : 'right-1/2 bg-negative',
        ].join(' ')}
        style={{ width }}
      />
    </div>
  )
}

function AvatBar({ value, maxAbs }: { value: number; maxAbs: number }) {
  const pct = maxAbs > 0 ? Math.min(Math.abs(value) / maxAbs, 1) : 0
  return (
    <div className="flex h-3.5 w-[4.25rem] items-center gap-1">
      <div className="relative h-2.5 flex-1 overflow-hidden bg-white/[0.04]">
        <div
          className="absolute inset-y-0 left-0 bg-[#a67c52]"
          style={{ width: `${Math.max(pct * 100, value === 0 ? 0 : 8)}%` }}
        />
      </div>
    </div>
  )
}

function WeiCheck({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-[11px] text-text-secondary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[#3b82f6]"
      />
      {label}
    </label>
  )
}

/** World equity indices by region (WEI). */
export function WorldEquityIndicesWidget() {
  const [regionFocus, setRegionFocus] = useState('EMEA')
  const [movers, setMovers] = useState(true)
  const [volatility, setVolatility] = useState(false)
  const [ratios, setRatios] = useState(false)
  const [futures, setFutures] = useState(false)
  const [showAvat, setShowAvat] = useState(true)
  const [avatPeriod, setAvatPeriod] = useState('10D')
  const [metric, setMetric] = useState('pct-ytd')
  const [currency, setCurrency] = useState('GBP')
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [sortPct, setSortPct] = useState<'asc' | 'desc'>('desc')

  const regions = useMemo(() => {
    const q = query.trim().toLowerCase()
    return WORLD_EQUITY_REGIONS.map((region) => {
      let rows = [...region.rows]
      if (q) {
        rows = rows.filter((r) => r.name.toLowerCase().includes(q))
      }
      if (movers) {
        rows.sort((a, b) =>
          sortPct === 'desc'
            ? Math.abs(b.pctChg) - Math.abs(a.pctChg)
            : Math.abs(a.pctChg) - Math.abs(b.pctChg),
        )
      } else {
        rows.sort((a, b) =>
          sortPct === 'desc' ? b.pctChg - a.pctChg : a.pctChg - b.pctChg,
        )
      }
      return { ...region, rows }
    }).filter((r) => r.rows.length > 0)
  }, [movers, query, sortPct])

  const maxPct = useMemo(() => {
    let m = 0.01
    for (const r of WORLD_EQUITY_REGIONS) {
      for (const row of r.rows) m = Math.max(m, Math.abs(row.pctChg))
    }
    return m
  }, [])

  const maxAvat = useMemo(() => {
    let m = 0.01
    for (const r of WORLD_EQUITY_REGIONS) {
      for (const row of r.rows) m = Math.max(m, Math.abs(row.avat))
    }
    return m
  }, [])

  const colSpan =
    9 + (showAvat ? 1 : 0) + (futures ? 1 : 0) + (volatility ? 1 : 0)

  return (
    <div className="flex h-full min-h-0 flex-col text-[11px]">
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-border-subtle px-1.5 py-1">
        <OpaqueSelect
          value="news"
          options={[{ value: 'news', label: 'News' }]}
          onChange={() => {}}
          aria-label="News"
          triggerClassName="h-5 border-border-subtle bg-white/[0.06] px-1.5"
        />
        <OpaqueSelect
          value={regionFocus}
          options={[
            { value: 'All', label: 'All' },
            { value: 'Americas', label: 'Americas' },
            { value: 'EMEA', label: 'EMEA' },
            { value: 'Asia/Pacific', label: 'Asia/Pacific' },
          ]}
          onChange={setRegionFocus}
          aria-label="Region"
          triggerClassName={WEI_ORANGE_TRIGGER}
        />
        <WeiCheck label="Movers" checked={movers} onChange={setMovers} />
        <WeiCheck
          label="Volatility"
          checked={volatility}
          onChange={setVolatility}
        />
        <WeiCheck label="Ratios" checked={ratios} onChange={setRatios} />
        <WeiCheck label="Futures" checked={futures} onChange={setFutures} />
        <WeiCheck label="Δ AVAT" checked={showAvat} onChange={setShowAvat} />
        {showAvat ? (
          <OpaqueSelect
            value={avatPeriod}
            options={[
              { value: '5D', label: '5D' },
              { value: '10D', label: '10D' },
              { value: '20D', label: '20D' },
            ]}
            onChange={setAvatPeriod}
            aria-label="AVAT period"
            triggerClassName={WEI_ORANGE_TRIGGER}
          />
        ) : null}
        <OpaqueSelect
          value={metric}
          options={[
            { value: 'pct-ytd', label: '%Chg YTD' },
            { value: 'pct-1m', label: '%Chg 1M' },
            { value: 'pct-3m', label: '%Chg 3M' },
          ]}
          onChange={setMetric}
          aria-label="Metric"
          triggerClassName={WEI_ORANGE_TRIGGER}
        />
        <OpaqueSelect
          value={currency}
          options={[
            { value: 'GBP', label: 'GBP' },
            { value: 'USD', label: 'USD' },
            { value: 'EUR', label: 'EUR' },
          ]}
          onChange={setCurrency}
          aria-label="Currency"
          triggerClassName={WEI_ORANGE_TRIGGER}
        />
        <div className="ml-auto flex items-center gap-1">
          {showSearch ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => {
                if (!query) setShowSearch(false)
              }}
              placeholder="Find index…"
              className="h-5 w-28 rounded-[2px] border border-border bg-bg px-1.5 text-[11px] text-text outline-none"
            />
          ) : null}
          <button
            type="button"
            title="Search indices"
            onClick={() => setShowSearch((v) => !v)}
            className="inline-flex h-5 w-5 items-center justify-center rounded-[2px] text-text-muted hover:bg-white/[0.06] hover:text-text"
          >
            <Search size={12} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead className="sticky top-0 z-[1] bg-panel-header">
            <tr className="border-b border-border-subtle text-text-secondary">
              <th className="h-6 px-1.5 text-left font-semibold">Index</th>
              <th className="h-6 px-1 text-left font-semibold">2Day</th>
              {futures ? (
                <th className="h-6 px-1 text-right font-semibold">Future</th>
              ) : null}
              <th className="h-6 px-1 text-right font-semibold">Value</th>
              <th className="h-6 px-1 text-right font-semibold">Net Chg</th>
              <th className="h-6 px-1 text-right font-semibold">
                <button
                  type="button"
                  onClick={() =>
                    setSortPct((s) => (s === 'desc' ? 'asc' : 'desc'))
                  }
                  className="inline-flex items-center gap-0.5 text-sky-400 hover:text-sky-300"
                  title="Sort by %Chg"
                >
                  %Chg
                  <span className="text-[9px]">
                    {sortPct === 'desc' ? '▼' : '▲'}
                  </span>
                </button>
              </th>
              {showAvat ? (
                <th className="h-6 px-1 text-right font-semibold">
                  Δ AVAT{avatPeriod !== '10D' ? ` ${avatPeriod}` : ''}
                </th>
              ) : null}
              <th className="h-6 px-1 text-right font-semibold">Time</th>
              <th className="h-6 px-1 text-right font-semibold">Adv/Dcl</th>
              {volatility ? (
                <th className="h-6 px-1 text-right font-semibold">Vol</th>
              ) : null}
              <th className="h-6 px-1 text-right font-semibold">
                {metric === 'pct-ytd'
                  ? '%Ytd'
                  : metric === 'pct-1m'
                    ? '%1M'
                    : '%3M'}
              </th>
              <th className="h-6 px-1.5 text-right font-semibold">
                %YtdCur
              </th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <Fragment key={region.region}>
                <tr className="bg-white/[0.04]">
                  <td
                    colSpan={colSpan}
                    className={[
                      'h-6 px-1.5 text-[11px] font-semibold',
                      regionFocus === region.region
                        ? HEADLINE
                        : 'text-text-secondary',
                    ].join(' ')}
                  >
                    {region.region}
                  </td>
                </tr>
                {region.rows.map((row) => (
                  <WeiRow
                    key={row.name}
                    row={row}
                    hover={hover === row.name}
                    onHover={() => setHover(row.name)}
                    showAvat={showAvat}
                    showFutures={futures}
                    showVolatility={volatility}
                    currency={currency}
                    metric={metric}
                    maxPct={maxPct}
                    maxAvat={maxAvat}
                  />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function WeiRow({
  row,
  hover,
  onHover,
  showAvat,
  showFutures,
  showVolatility,
  currency,
  metric,
  maxPct,
  maxAvat,
}: {
  row: EquityIndexRow
  hover: boolean
  onHover: () => void
  showAvat: boolean
  showFutures: boolean
  showVolatility: boolean
  currency: string
  metric: string
  maxPct: number
  maxAvat: number
}) {
  const pos = row.pctChg >= 0
  const ytdVal =
    metric === 'pct-1m'
      ? row.ytd * 0.22
      : metric === 'pct-3m'
        ? row.ytd * 0.48
        : row.ytd
  // Simple FX demo adjustment vs GBP baseline
  const fx =
    currency === 'USD' ? 1.12 : currency === 'EUR' ? 1.05 : 1
  const ytdCur = row.ytdCur * fx

  return (
    <tr
      onMouseEnter={onHover}
      className={[
        'border-b border-border-subtle',
        hover ? 'bg-[#3a3428]' : 'hover:bg-white/[0.03]',
      ].join(' ')}
    >
      <td className={`h-6 whitespace-nowrap px-1.5 font-medium ${HEADLINE}`}>
        {row.name}
      </td>
      <td className="h-6 px-1">
        <WeiSpark series={row.spark} />
      </td>
      {showFutures ? (
        <td className="h-6 px-1 text-right font-mono tabular-nums text-text-secondary">
          {row.value}
          {row.delayed ? (
            <span className="ml-0.5 text-[9px] text-text-muted">d</span>
          ) : null}
        </td>
      ) : null}
      <td className="h-6 whitespace-nowrap px-1 text-right font-mono tabular-nums text-text">
        {row.value}
        {row.delayed ? (
          <span className="ml-0.5 text-[9px] text-text-muted">d</span>
        ) : null}
      </td>
      <td
        className={[
          'h-6 px-1 text-right font-mono tabular-nums',
          pos ? 'text-positive' : 'text-negative',
        ].join(' ')}
      >
        {fmtSigned(row.netChg)}
      </td>
      <td className="h-6 px-1">
        <div className="flex items-center justify-end gap-1">
          <PctChgBar value={row.pctChg} maxAbs={maxPct} />
          <span
            className={[
              'w-12 text-right font-mono tabular-nums',
              pos ? 'text-positive' : 'text-negative',
            ].join(' ')}
          >
            {fmtSigned(row.pctChg)}%
          </span>
        </div>
      </td>
      {showAvat ? (
        <td className="h-6 px-1">
          <div className="flex items-center justify-end gap-1">
            <AvatBar value={row.avat} maxAbs={maxAvat} />
            <span className="w-10 text-right font-mono tabular-nums text-text-secondary">
              {fmtSigned(row.avat)}%
            </span>
          </div>
        </td>
      ) : null}
      <td className="h-6 px-1 text-right font-mono tabular-nums text-text-muted">
        {row.time}
      </td>
      <td className="h-6 whitespace-nowrap px-1 text-right font-mono tabular-nums">
        <span className="text-text">{row.adv}</span>
        <span className="text-text-muted"> / </span>
        <span className={HEADLINE}>{row.dcl}</span>
      </td>
      {showVolatility ? (
        <td className="h-6 px-1 text-right font-mono tabular-nums text-text-secondary">
          {(Math.abs(row.pctChg) * 12 + 8).toFixed(1)}
        </td>
      ) : null}
      <td
        className={[
          'h-6 px-1 text-right font-mono tabular-nums',
          ytdVal >= 0 ? 'text-positive' : 'text-negative',
        ].join(' ')}
      >
        {fmtSigned(ytdVal)}%
      </td>
      <td
        className={[
          'h-6 px-1.5 text-right font-mono tabular-nums',
          ytdCur >= 0 ? 'text-positive' : 'text-negative',
        ].join(' ')}
      >
        {fmtSigned(ytdCur)}%
      </td>
    </tr>
  )
}

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

function formatOffset(hours: number) {
  const sign = hours >= 0 ? '+' : '-'
  const abs = Math.abs(hours)
  const h = Math.floor(abs)
  const m = Math.round((abs - h) * 60)
  return `GMT ${sign}${h}:${pad2(m)}`
}

/** Live multi-city world clock. */
export function InternationalClockWidget({ cities }: { cities?: string }) {
  const [now, setNow] = useState(() => Date.now())
  const clocks = parseClockCities(cities)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex h-full min-h-0 items-stretch gap-0 overflow-auto px-1 py-2">
      {clocks.map((clock) => {
        // Fixed GMT offsets via UTC getters (demo-stable across host TZ)
        const d = new Date(now + clock.offsetHours * 3600_000)
        const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`
        const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
          d.getUTCDay()
        ]
        const date = `${weekday} ${pad2(d.getUTCMonth() + 1)}/${pad2(d.getUTCDate())}`

        return (
          <div
            key={clock.city}
            className="flex min-w-[120px] flex-1 flex-col items-center justify-center border-r border-border-subtle px-3 last:border-r-0"
          >
            <div className="font-mono text-[22px] font-semibold tabular-nums tracking-tight text-text">
              {time}
            </div>
            <div className="mt-0.5 text-[11px] text-text-muted">{date}</div>
            <div className="text-[11px] text-text-muted">
              {formatOffset(clock.offsetHours)}
            </div>
            <div className={`mt-2 text-[13px] font-semibold ${HEADLINE}`}>
              {clock.city}
            </div>
            <div className="text-[11px] text-text-muted">{clock.region}</div>
          </div>
        )
      })}
    </div>
  )
}
