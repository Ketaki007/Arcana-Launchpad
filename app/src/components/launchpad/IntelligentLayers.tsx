import { useEffect, useState, type DragEvent as ReactDragEvent } from 'react'
import {
  X,
  Sparkles,
  Activity,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react'

/** Document-with-outbound-arrow — Research Notes / send-to-RMS affordance. */
export function SendNoteIcon({
  size = 14,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M3.25 2.25h6.1L12.75 5.65v8.1H3.25v-11.5z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M9.35 2.25v3.4h3.4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M5.1 7.15h3.6M5.1 8.85h3M5.1 10.55h2.2"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M8.2 8.85h5.4M11.85 6.9l1.95 1.95-1.95 1.95"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
import {
  getSecurity,
  NEWS_ITEMS,
  FINANCIALS,
  SECURITIES,
  PEERS,
} from '../../data/market'
import {
  evidenceFromDrop,
  readResearchDragData,
  type ResearchEvidenceItem,
} from '../../lib/researchDnD'

type CatchUpWidget = {
  instanceId: string
  id: string
  name: string
}

type CatchUpProps = {
  ticker: string
  viewName: string
  pageName: string
  widgets: CatchUpWidget[]
  onClose: () => void
  onContinue: () => void
  onOpenWidget?: (instanceId: string) => void
}

function findWidget(
  widgets: CatchUpWidget[],
  ...ids: string[]
): CatchUpWidget | undefined {
  for (const id of ids) {
    const hit = widgets.find((w) => w.id === id)
    if (hit) return hit
  }
  return undefined
}

export function CatchUpPanel({
  ticker,
  viewName,
  pageName,
  widgets,
  onClose,
  onContinue,
  onOpenWidget,
}: CatchUpProps) {
  const s = getSecurity(ticker)
  const news = NEWS_ITEMS.filter(
    (n) => n.ticker === ticker || n.ticker === 'AMD' || n.ticker === 'MSFT',
  ).slice(0, 3)
  const financials = FINANCIALS[ticker] ?? FINANCIALS.NVDA ?? []
  const peers = SECURITIES.filter((p) => p.ticker !== ticker).slice(0, 3)

  const newsWidget = findWidget(widgets, 'news', 'news-feed')
  const chartWidget = findWidget(widgets, 'chart', 'graphic-dashboard')
  const faWidget = findWidget(widgets, 'financial-analysis')
  const rvWidget = findWidget(widgets, 'relative-valuation')

  const open = (w?: CatchUpWidget) => {
    if (!w || !onOpenWidget) return
    onOpenWidget(w.instanceId)
  }

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-bg-elevated">
      <header className="flex h-8 shrink-0 items-center gap-2 border-b border-border px-3">
        <Activity size={13} className="shrink-0 text-selection" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold">
            Workspace Catch-up
          </div>
          <div className="truncate text-[10px] text-text-muted">
            {s.ticker} · Away 14h 22m
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text"
          aria-label="Close catch-up"
        >
          <X size={14} />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-[12px]">
        <section>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Resume Previous Context
          </div>
          <p className="text-text-secondary">
            You left off on {pageName} in {viewName}, reviewing {s.ticker}
            {rvWidget ? ` in ${rvWidget.name}` : ''}.
          </p>
        </section>

        <section>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Market Activity
          </div>
          <p className="text-text-secondary">
            {s.ticker}{' '}
            <span className={s.changePct >= 0 ? 'text-positive' : 'text-negative'}>
              {s.changePct >= 0 ? '+' : ''}
              {s.changePct.toFixed(2)}%
            </span>{' '}
            since your last session. Last {s.last.toFixed(2)} · Volume{' '}
            {s.volume}.
          </p>
          <ul className="mt-1.5 space-y-1 text-text-secondary">
            {peers.map((p) => (
              <li key={p.ticker}>
                • {p.ticker}{' '}
                <span className={p.changePct >= 0 ? 'text-positive' : 'text-negative'}>
                  {p.changePct >= 0 ? '+' : ''}
                  {p.changePct.toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
          {chartWidget ? (
            <button
              type="button"
              onClick={() => open(chartWidget)}
              className="mt-1.5 text-[11px] text-selection hover:underline"
            >
              Open {chartWidget.name} →
            </button>
          ) : null}
        </section>

        <section>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            News
          </div>
          <ul className="space-y-1 text-text-secondary">
            {news.map((n) => (
              <li key={n.id}>
                {newsWidget ? (
                  <button
                    type="button"
                    onClick={() => open(newsWidget)}
                    className="text-left hover:text-text"
                  >
                    • {n.headline}
                    <span className="ml-1 text-[11px] text-text-muted">
                      ({n.source} · {n.time})
                    </span>
                  </button>
                ) : (
                  <>
                    • {n.headline}
                    <span className="ml-1 text-[11px] text-text-muted">
                      ({n.source} · {n.time})
                    </span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Financial Updates
          </div>
          <ul className="space-y-1 text-text-secondary">
            <li>
              • Consensus EPS revised{' '}
              <span className="text-positive">+3.2%</span> for the current
              quarter.
            </li>
            <li>
              • Revenue estimate raised to{' '}
              {financials.find((f) => f.metric === 'Revenue')?.consensus ?? '—'}
              .
            </li>
            <li>
              • Gross margin consensus{' '}
              {financials.find((f) => f.metric === 'Gross Margin')?.consensus ??
                '—'}
              .
            </li>
          </ul>
          {faWidget || rvWidget ? (
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {faWidget ? (
                <button
                  type="button"
                  onClick={() => open(faWidget)}
                  className="text-[11px] text-selection hover:underline"
                >
                  Open {faWidget.name} →
                </button>
              ) : null}
              {rvWidget ? (
                <button
                  type="button"
                  onClick={() => open(rvWidget)}
                  className="text-[11px] text-selection hover:underline"
                >
                  Open {rvWidget.name} →
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Workspace Activity
          </div>
          <ul className="space-y-1 text-text-secondary">
            <li>
              • {pageName} now has {widgets.length} widgets (
              {widgets
                .map((w) => w.name)
                .slice(0, 3)
                .join(', ')}
              {widgets.length > 3 ? ` +${widgets.length - 3} more` : ''}).
            </li>
            <li>
              • Chart range last set to 1Y; Quote Monitor columns remain
              Standard.
            </li>
            <li>
              • Note from yesterday 16:18: “Check peer EV/EBITDA vs AI capex
              cycle — revisit after hyperscaler prints.”
            </li>
          </ul>
        </section>
      </div>

      <footer className="shrink-0 space-y-1.5 border-t border-border p-2">
        <button
          type="button"
          onClick={onContinue}
          className="h-7 w-full rounded-[2px] bg-selection text-[11px] font-medium text-white hover:bg-[#2563eb]"
        >
          Continue analysis
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-full rounded-[2px] border border-border text-[11px] text-text-secondary hover:text-text"
        >
          Dismiss
        </button>
      </footer>
    </aside>
  )
}

export type ResearchNotesDemoMode = 'open' | 'assembled' | 'sent' | null

type ResearchNotesProps = {
  ticker: string
  widgetNames: string[]
  onClose: () => void
  /** Walkthrough / Figma capture states for Research Notes. */
  demoMode?: ResearchNotesDemoMode
}

type SentRmsNote = {
  id: string
  title: string
  preview: string
  destination: string
  sentAtLabel: string
  url: string
}

const RMS_DESTINATION = 'US Equities / Semiconductors'

function noteTitleFromBody(body: string): string {
  const first = body
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean)
  if (!first) return 'Research note'
  return first.length > 64 ? `${first.slice(0, 63)}…` : first
}

function notePreviewFromBody(body: string): string {
  const lines = body
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const rest = lines.slice(1).join(' ')
  if (!rest) return `${lines.length} line${lines.length === 1 ? '' : 's'}`
  return rest.length > 90 ? `${rest.slice(0, 89)}…` : rest
}

function buildAssembledSuggestions(
  ticker: string,
  notes: string,
  widgetNames: string[],
): ResearchEvidenceItem[] {
  const s = getSecurity(ticker)
  const financials = FINANCIALS[ticker] ?? FINANCIALS.NVDA ?? []
  const news = NEWS_ITEMS.filter(
    (n) => n.ticker === ticker || n.ticker === 'AMD',
  ).slice(0, 3)
  const peer = PEERS.find((p) => p.ticker === ticker)
  const items: ResearchEvidenceItem[] = [
    {
      id: `asm-price-${ticker}`,
      kind: 'metric',
      title: `${s.ticker} ${s.last.toFixed(2)} (${s.changePct >= 0 ? '+' : ''}${s.changePct.toFixed(2)}%)`,
      detail: 'Session move from Quote / Watchlist',
      source: 'Watchlist',
      origin: 'assembled',
    },
  ]
  for (const f of financials.slice(0, 2)) {
    items.push({
      id: `asm-fa-${f.metric}`,
      kind: 'metric',
      title: `${f.metric}: ${f.ttm}`,
      detail: `YoY ${f.yoy} · consensus ${f.consensus}`,
      source: 'Financial Analysis',
      origin: 'assembled',
    })
  }
  if (peer) {
    items.push({
      id: `asm-rv-${ticker}`,
      kind: 'metric',
      title: `${ticker} ${peer.pe != null ? `${peer.pe.toFixed(1)}x P/E` : 'n/a P/E'}, ${peer.ps.toFixed(1)}x P/S`,
      detail: 'Relative Valuation peers',
      source: 'Relative Valuation',
      origin: 'assembled',
    })
  }
  for (const n of news) {
    items.push({
      id: `asm-news-${n.id}`,
      kind: 'news',
      title: n.headline,
      detail: `${n.source} · ${n.time}`,
      source: 'News',
      origin: 'assembled',
    })
  }
  if (notes.trim()) {
    items.push({
      id: 'asm-pattern',
      kind: 'widget',
      title: 'Pattern match on your notes',
      detail: `Grounded across ${widgetNames.length || 5} workspace widgets for ${ticker}`,
      source: 'Workspace',
      origin: 'assembled',
    })
  }
  return items
}

/** Lean 300px split panel — notes first, then optional AI-assembled suggestions. */
/** Seeded analyst note for the US Equities demo → ready to send to RMS. */
export const US_EQUITIES_SAMPLE_NOTES = `US Equities desk note — 18 Jul 2026

Context: Ran morning pass on US Equities (Overview). Book still overweight mega-cap AI infra; wanted a clean read before midday risk.

NVDA (focus)
• Tape: constructive on the session; volume supportive vs 20d average. Not chasing the open — waiting for a pullback into VWAP / prior day value area.
• FA: revenue / GM / EPS prints still well ahead of street; consensus has been chasing. Near-term risk is estimate revision fatigue if guide is “only” in-line.
• RV: multiples remain elevated vs AMD / AVGO / semis complex. Fine if growth trajectory holds; less fine if hyperscaler capex language softens on the next print.
• News / wire: data-center / AI demand narrative intact overnight. No thesis-breaking item in the last 24h, but headline risk into any Fed-speak or big-tech spend commentary.

Cross-check
• TSLA (VQ open): separate tape — not using it as a beta hedge for the NVDA sleeve today.
• Peer tape (AMD etc.) moving with semis; relative under/outperformance vs NVDA worth a mark at the close.

Working call (desk notes for RMS — not a formal recommendation)
Maintain overweight NVDA into the next earnings window, but trim 10–15% of the sleeve if (a) EV/EBITDA expands further without an estimate raise, or (b) hyperscaler commentary turns mixed. Attaching FA/RV context + wire clips from this Launchpad view.

Next: send pack to Arcana RMS → US Equities / Semiconductors for the weekly PM review.`

function demoSentNote(): SentRmsNote {
  const body = US_EQUITIES_SAMPLE_NOTES
  const id = 'rms-demo-sent'
  return {
    id,
    title: noteTitleFromBody(body),
    preview: notePreviewFromBody(body),
    destination: RMS_DESTINATION,
    sentAtLabel: 'Just now',
    url: `https://rms.arcana.com/workspaces/us-equities/notes/${id}`,
  }
}

export function ResearchNotesPanel({
  ticker,
  widgetNames,
  onClose,
  demoMode = null,
}: ResearchNotesProps) {
  const s = getSecurity(ticker)
  const [notes, setNotes] = useState(() =>
    demoMode === 'sent' ? '' : US_EQUITIES_SAMPLE_NOTES,
  )
  const [loading, setLoading] = useState(false)
  const [evidence, setEvidence] = useState<ResearchEvidenceItem[]>(() =>
    demoMode === 'assembled'
      ? buildAssembledSuggestions(
          ticker,
          US_EQUITIES_SAMPLE_NOTES,
          widgetNames,
        )
      : [],
  )
  const [dragOver, setDragOver] = useState(false)
  const [sentLabel, setSentLabel] = useState<string | null>(null)
  const [sentNotes, setSentNotes] = useState<SentRmsNote[]>(() =>
    demoMode === 'sent' ? [demoSentNote()] : [],
  )
  const [sentOpen, setSentOpen] = useState(true)

  useEffect(() => {
    if (!demoMode) return
    if (demoMode === 'open') {
      setNotes(US_EQUITIES_SAMPLE_NOTES)
      setEvidence([])
      setSentNotes([])
      setSentLabel(null)
    } else if (demoMode === 'assembled') {
      setNotes(US_EQUITIES_SAMPLE_NOTES)
      setEvidence(
        buildAssembledSuggestions(
          ticker,
          US_EQUITIES_SAMPLE_NOTES,
          widgetNames,
        ),
      )
      setSentNotes([])
      setSentLabel(null)
    } else if (demoMode === 'sent') {
      setNotes('')
      setEvidence([])
      setSentNotes([demoSentNote()])
      setSentLabel(null)
      setSentOpen(true)
    }
  }, [demoMode, ticker, widgetNames])

  const canAssemble = notes.trim().length > 0 && !loading

  function assemble() {
    if (!canAssemble) return
    setLoading(true)
    window.setTimeout(() => {
      const assembled = buildAssembledSuggestions(ticker, notes, widgetNames)
      setEvidence((prev) => {
        const kept = prev.filter((e) => e.origin === 'dropped')
        const keptKeys = new Set(kept.map((e) => e.title))
        return [
          ...kept,
          ...assembled.filter((e) => !keptKeys.has(e.title)),
        ]
      })
      setLoading(false)
    }, 1100)
  }

  function removeEvidence(id: string) {
    setEvidence((prev) => prev.filter((e) => e.id !== id))
  }

  function sendToRms() {
    const body = notes.trim()
    if (!body) return
    const id = `rms-${Date.now().toString(36)}`
    const sent: SentRmsNote = {
      id,
      title: noteTitleFromBody(body),
      preview: notePreviewFromBody(body),
      destination: RMS_DESTINATION,
      sentAtLabel: 'Just now',
      url: `https://rms.arcana.com/workspaces/us-equities/notes/${id}`,
    }
    setSentNotes((prev) => [sent, ...prev])
    setSentOpen(true)
    setNotes('')
    setEvidence([])
    setSentLabel(`Sent to Arcana RMS · ${RMS_DESTINATION}`)
    window.setTimeout(() => setSentLabel(null), 2800)
  }

  function onDrop(e: ReactDragEvent) {
    e.preventDefault()
    setDragOver(false)
    const payload = readResearchDragData(e)
    if (!payload) return
    const item = evidenceFromDrop(payload)
    setEvidence((prev) =>
      prev.some(
        (e) => e.title === item.title && e.kind === item.kind,
      )
        ? prev
        : [...prev, item],
    )
  }

  return (
    <aside
      className={[
        'flex w-[300px] shrink-0 flex-col border-l border-border bg-bg-elevated',
        dragOver ? 'ring-1 ring-inset ring-selection' : '',
      ].join(' ')}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragOver(false)
        }
      }}
      onDrop={onDrop}
    >
      <header className="flex h-8 shrink-0 items-center gap-2 border-b border-border px-3">
        <SendNoteIcon size={14} className="shrink-0 text-[#e8873a]" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold">Research Notes</div>
          <div className="truncate text-[10px] text-text-muted">{s.ticker}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text"
          aria-label="Close research notes"
        >
          <X size={14} />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3 text-[12px]">
        {sentNotes.length > 0 ? (
          <section className="rounded-[2px] border border-border-subtle">
            <button
              type="button"
              onClick={() => setSentOpen((v) => !v)}
              className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left hover:bg-white/[0.03]"
              aria-expanded={sentOpen}
            >
              <ChevronDown
                size={12}
                className={[
                  'shrink-0 text-text-muted transition-transform',
                  sentOpen ? '' : '-rotate-90',
                ].join(' ')}
              />
              <span className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                Sent to RMS
              </span>
              <span className="tabular-nums text-[10px] text-text-muted">
                {sentNotes.length}
              </span>
            </button>
            {sentOpen ? (
              <ul className="border-t border-border-subtle">
                {sentNotes.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-white/[0.03]"
                  >
                    <span
                      className="min-w-0 flex-1 truncate text-[11px] text-text"
                      title={item.title}
                    >
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-text-muted">
                      {item.sentAtLabel}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Arcana RMS"
                      aria-label={`Open “${item.title}” in Arcana RMS`}
                      className="inline-flex shrink-0 items-center justify-center rounded-[2px] p-0.5 text-selection hover:bg-selection/15 hover:text-[#93c5fd]"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-text-secondary">
            New note
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Decision, note, or suggestion for ${s.ticker}…`}
            className="h-52 w-full resize-y rounded-[2px] border border-border bg-bg px-2 py-1.5 font-mono text-[11px] leading-relaxed text-text outline-none placeholder:text-text-muted focus:border-selection"
          />
        </label>

        <button
          type="button"
          disabled={!canAssemble}
          onClick={assemble}
          className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-[2px] bg-selection text-[11px] font-medium text-white hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Assembling…
            </>
          ) : (
            <>
              <Sparkles size={13} />
              Assemble supporting info
            </>
          )}
        </button>

        <p className="text-[10px] leading-relaxed text-text-muted">
          Suggestions are grounded in your workspace analysis. Drag a widget
          title, watchlist row, or news item here to pin it. Remove any you
          don’t need.
        </p>

        {evidence.length > 0 ? (
          <section>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Supporting info
            </div>
            <ul className="space-y-1.5">
              {evidence.map((item) => (
                <li
                  key={item.id}
                  className="group flex gap-1.5 rounded-[2px] border border-border-subtle bg-panel px-2 py-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-text">{item.title}</div>
                    {item.detail ? (
                      <div className="mt-0.5 text-[10px] text-text-muted">
                        {item.detail}
                        {item.source ? ` · ${item.source}` : ''}
                        {item.origin === 'assembled' ? ' · suggestion' : ' · pinned'}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    title="Remove"
                    aria-label="Remove suggestion"
                    onClick={() => removeEvidence(item.id)}
                    className="shrink-0 text-text-muted opacity-70 hover:text-text group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div
            className={[
              'rounded-[2px] border border-dashed px-2 py-4 text-center text-[11px] text-text-muted',
              dragOver
                ? 'border-selection bg-selection-muted text-text-secondary'
                : 'border-border',
            ].join(' ')}
          >
            {dragOver
              ? 'Drop to pin in Research Notes'
              : 'Drop widgets, rows, or headlines here'}
          </div>
        )}
      </div>

      <footer className="shrink-0 space-y-1.5 border-t border-border p-2">
        {sentLabel ? (
          <p className="text-[10px] text-positive">{sentLabel}</p>
        ) : null}
        <button
          type="button"
          disabled={!notes.trim()}
          onClick={sendToRms}
          className="h-7 w-full rounded-[2px] bg-selection text-[11px] font-medium text-white hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send to RMS
        </button>
      </footer>
    </aside>
  )
}

/** @deprecated Use ResearchNotesPanel */
export const DecisionComposerPanel = ResearchNotesPanel

type HealthProps = {
  widgetCount: number
  unusedCount: number
  onClose: () => void
}

export function WorkspaceHealthPanel({
  widgetCount,
  unusedCount,
  onClose,
}: HealthProps) {
  return (
    <div
      role="dialog"
      aria-label="Workspace Health"
      className="absolute right-0 top-full z-50 mt-0.5 w-56 rounded-[2px] border border-border bg-panel shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
    >
      <header className="flex items-center gap-2 border-b border-border px-2.5 py-1.5">
        <AlertTriangle size={12} className="shrink-0 text-warning" />
        <div className="min-w-0 flex-1 truncate text-[11px] font-semibold">
          Workspace Health
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text"
          aria-label="Close workspace health"
        >
          <X size={12} />
        </button>
      </header>
      <div className="flex items-baseline justify-between gap-3 px-2.5 py-2 text-[11px] text-text">
        <span>
          <span className="tabular-nums font-semibold">{widgetCount}</span>
          <span className="text-text-muted"> total</span>
        </span>
        <span>
          <span className="tabular-nums font-semibold">{unusedCount}</span>
          <span className="text-text-muted"> unused</span>
        </span>
      </div>
    </div>
  )
}
