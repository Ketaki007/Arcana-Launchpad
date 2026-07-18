import {
  SECURITIES,
  NEWS_ITEMS,
  FINANCIALS,
  PEERS,
  CHART_SERIES,
  getSecurity,
} from '../../../data/market'
import { setResearchDragData } from '../../../lib/researchDnD'

type SelectProps = {
  selectedTicker: string
  onSelect: (ticker: string) => void
}

export function WatchlistWidget({ selectedTicker, onSelect }: SelectProps) {
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr className="border-b border-border-subtle text-text-secondary">
          <th className="h-[26px] px-1.5 text-left font-semibold">Ticker</th>
          <th className="h-[26px] px-1.5 text-left font-semibold">Name</th>
          <th className="h-[26px] px-1.5 text-right font-semibold">Last</th>
          <th className="h-[26px] px-1.5 text-right font-semibold">Chg %</th>
          <th className="h-[26px] px-1.5 text-right font-semibold">Vol</th>
        </tr>
      </thead>
      <tbody>
        {SECURITIES.map((s) => {
          const active = s.ticker === selectedTicker
          const pos = s.changePct >= 0
          return (
            <tr
              key={s.ticker}
              draggable
              onClick={() => onSelect(s.ticker)}
              onDragStart={(e) =>
                setResearchDragData(e, {
                  kind: 'security',
                  title: `${s.ticker} ${s.last.toFixed(2)} (${s.changePct >= 0 ? '+' : ''}${s.changePct.toFixed(2)}%)`,
                  detail: s.name,
                  source: 'Watchlist',
                })
              }
              className={[
                'cursor-pointer border-b border-border-subtle',
                active ? 'bg-selection-muted' : 'hover:bg-white/[0.03]',
              ].join(' ')}
            >
              <td className="h-6 px-1.5 font-medium text-text">{s.ticker}</td>
              <td className="h-6 truncate px-1.5 text-text-secondary">{s.name}</td>
              <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums">
                {s.last.toFixed(2)}
              </td>
              <td
                className={[
                  'h-6 px-1.5 text-right font-mono text-[11px] tabular-nums',
                  pos ? 'text-positive' : 'text-negative',
                ].join(' ')}
              >
                {pos ? '+' : ''}
                {s.changePct.toFixed(2)}%
              </td>
              <td className="h-6 px-1.5 text-right text-text-muted">{s.volume}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function QuoteMonitorWidget({ ticker }: { ticker: string }) {
  const s = getSecurity(ticker)
  const pos = s.changePct >= 0
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-2 text-[12px]">
      <div>
        <div className="text-[11px] text-text-muted">Security</div>
        <div className="font-semibold">
          {s.ticker} · {s.name}
        </div>
      </div>
      <div>
        <div className="text-[11px] text-text-muted">Last</div>
        <div className="font-mono text-[16px] font-semibold tabular-nums">
          {s.last.toFixed(2)}
        </div>
      </div>
      <div>
        <div className="text-[11px] text-text-muted">Change</div>
        <div
          className={[
            'font-mono tabular-nums',
            pos ? 'text-positive' : 'text-negative',
          ].join(' ')}
        >
          {pos ? '+' : ''}
          {s.changePct.toFixed(2)}%
        </div>
      </div>
      <div>
        <div className="text-[11px] text-text-muted">Volume</div>
        <div className="font-mono tabular-nums">{s.volume}</div>
      </div>
      <div>
        <div className="text-[11px] text-text-muted">Sector</div>
        <div>{s.sector}</div>
      </div>
      <div>
        <div className="text-[11px] text-text-muted">Bid / Ask</div>
        <div className="font-mono text-[11px] tabular-nums text-text-secondary">
          {(s.last - 0.04).toFixed(2)} / {(s.last + 0.03).toFixed(2)}
        </div>
      </div>
    </div>
  )
}

const VQ_VALUE = 'text-[#e8873a]'

/** Compact vertical quote panel (Bloomberg-style Vert). */
export function VerticalQuoteWidget({ ticker }: { ticker: string }) {
  const s = getSecurity(ticker)
  const bid = s.last - 0.83
  const ask = s.last + 0.15
  const rows: { label: string; value: string; emphasize?: boolean }[] = [
    { label: '', value: `${s.name.toUpperCase()} d`, emphasize: true },
    { label: 'Last Price', value: `${s.last.toFixed(2)} c` },
    { label: 'Bid', value: bid.toFixed(2) },
    { label: 'Ask', value: ask.toFixed(2) },
    { label: 'Country', value: 'US' },
  ]

  return (
    <div className="flex h-full flex-col px-2 py-1.5 text-[12px]">
      {rows.map((row) =>
        row.label ? (
          <div
            key={row.label}
            className="flex h-6 items-center justify-between border-b border-border-subtle last:border-b-0"
          >
            <span className="text-text-secondary">{row.label}</span>
            <span className={`font-mono tabular-nums ${VQ_VALUE}`}>
              {row.value}
            </span>
          </div>
        ) : (
          <div
            key="name"
            className="flex h-6 items-center justify-end border-b border-border-subtle"
          >
            <span className={`truncate font-medium ${VQ_VALUE}`}>
              {row.value}
            </span>
          </div>
        ),
      )}
    </div>
  )
}

const DESCRIPTIONS: Record<string, string> = {
  NVDA: 'NVIDIA designs GPUs and systems for gaming, professional visualization, data centers and automotive. AI accelerators and CUDA software are the primary growth engines.',
  AAPL: 'Apple designs and sells consumer electronics, software and services. iPhone remains the core franchise, with Services and Wearables contributing growing high-margin revenue.',
  AMD: 'AMD designs CPUs, GPUs and accelerators for PCs, gaming and data centers. Competitive positioning versus NVIDIA in AI GPUs is a key analytical focus.',
  MSFT: 'Microsoft provides productivity software, cloud infrastructure (Azure) and enterprise platforms. AI copilots and Azure growth drive the current investment narrative.',
}

export function DescriptionWidget({ ticker }: { ticker: string }) {
  const s = getSecurity(ticker)
  const text =
    DESCRIPTIONS[ticker] ??
    `${s.name} is an investable security in ${s.sector}. Select peers and review fundamentals to build conviction.`

  return (
    <div className="space-y-2 p-2 text-[12px]">
      <div className="font-semibold">
        {s.ticker} — {s.name}
      </div>
      <p className="leading-relaxed text-text-secondary">{text}</p>
      <div className="grid grid-cols-3 gap-2 border-t border-border-subtle pt-2 text-[11px]">
        <div>
          <div className="text-text-muted">Sector</div>
          <div>{s.sector}</div>
        </div>
        <div>
          <div className="text-text-muted">Exchange</div>
          <div>NASDAQ</div>
        </div>
        <div>
          <div className="text-text-muted">Currency</div>
          <div>USD</div>
        </div>
      </div>
    </div>
  )
}

export function NewsWidget({
  ticker,
  filter = 'All',
}: {
  ticker: string
  filter?: string
}) {
  const list =
    filter === 'Selected'
      ? NEWS_ITEMS.filter((n) => n.ticker === ticker)
      : filter === 'Related'
        ? NEWS_ITEMS.filter((n) => n.ticker === ticker || n.ticker === 'AMD')
        : NEWS_ITEMS

  return (
    <ul className="divide-y divide-border-subtle">
      {list.map((n) => (
        <li
          key={n.id}
          draggable
          title="Drag into Research Notes"
          onDragStart={(e) =>
            setResearchDragData(e, {
              kind: 'news',
              title: n.headline,
              detail: `${n.ticker} · ${n.source} · ${n.time}`,
              source: 'News',
            })
          }
          className="cursor-grab px-2 py-1.5 hover:bg-white/[0.03] active:cursor-grabbing"
        >
          <div className="flex items-start gap-2 text-[12px]">
            <span className="shrink-0 font-medium text-selection">{n.ticker}</span>
            <span className="min-w-0 flex-1 text-text">{n.headline}</span>
          </div>
          <div className="mt-0.5 pl-[42px] text-[11px] text-text-muted">
            {n.source} · {n.time}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ChartWidget({
  ticker,
  timeframe = '1Y',
  chartType = 'Line',
  compare = 'None',
}: {
  ticker: string
  timeframe?: string
  chartType?: string
  compare?: string
}) {
  const series = CHART_SERIES[ticker] ?? CHART_SERIES.NVDA
  const compareTicker =
    compare && compare !== 'None' && compare !== 'SPX' ? compare : null
  const compareSeries = compareTicker
    ? (CHART_SERIES[compareTicker] ?? null)
    : compare === 'SPX'
      ? (CHART_SERIES.NVDA ?? null)?.map((v, i, arr) => {
          // Lightweight synthetic benchmark for demo
          const t = i / Math.max(arr.length - 1, 1)
          return v * (0.92 + t * 0.08)
        }) ?? null
      : null
  const min = Math.min(
    ...series,
    ...(compareSeries ?? []),
  )
  const max = Math.max(
    ...series,
    ...(compareSeries ?? []),
  )
  const w = 320
  const h = 120
  const toPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * w
        const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4
        return `${x},${y}`
      })
      .join(' ')
  const points = toPoints(series)
  const comparePoints = compareSeries ? toPoints(compareSeries) : null
  const s = getSecurity(ticker)
  const pos = s.changePct >= 0
  const stroke = pos ? '#22c55e' : '#ef4444'

  return (
    <div className="flex h-full flex-col p-2">
      <div className="mb-1 flex items-baseline gap-2 text-[12px]">
        <span className="font-semibold">{ticker}</span>
        <span className="font-mono tabular-nums">{s.last.toFixed(2)}</span>
        <span
          className={[
            'font-mono text-[11px] tabular-nums',
            pos ? 'text-positive' : 'text-negative',
          ].join(' ')}
        >
          {pos ? '+' : ''}
          {s.changePct.toFixed(2)}%
        </span>
        {compare && compare !== 'None' ? (
          <span className="text-[11px] text-sky-400">vs {compare}</span>
        ) : null}
        <span className="ml-auto text-[11px] text-text-muted">
          {chartType} · {timeframe}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="min-h-0 w-full flex-1">
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={0}
            x2={w}
            y1={h * t}
            y2={h * t}
            stroke="#2a2a2a"
            strokeWidth={1}
          />
        ))}
        {chartType === 'Area' ? (
          <polyline
            fill={`${stroke}22`}
            stroke="none"
            points={`0,${h} ${points} ${w},${h}`}
          />
        ) : null}
        {chartType === 'Candle' ? (
          series.map((v, i) => {
            const x = (i / (series.length - 1)) * w
            const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4
            const prev = series[i - 1] ?? v
            const up = v >= prev
            return (
              <rect
                key={i}
                x={x - 2}
                y={Math.min(y, h - ((prev - min) / (max - min || 1)) * (h - 8) - 4)}
                width={4}
                height={Math.max(
                  2,
                  Math.abs(
                    y -
                      (h -
                        ((prev - min) / (max - min || 1)) * (h - 8) -
                        4),
                  ),
                )}
                fill={up ? '#22c55e' : '#ef4444'}
              />
            )
          })
        ) : (
          <polyline
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            points={points}
          />
        )}
        {comparePoints ? (
          <polyline
            fill="none"
            stroke="#60a5fa"
            strokeWidth={1.25}
            strokeDasharray="3 2"
            points={comparePoints}
          />
        ) : null}
      </svg>
    </div>
  )
}

export function FinancialAnalysisWidget({
  ticker,
  period = 'Quarterly',
}: {
  ticker: string
  period?: string
}) {
  const rows = FINANCIALS[ticker] ?? FINANCIALS.NVDA
  return (
    <div className="p-1">
      <div className="mb-1 px-1 text-[11px] text-text-muted">
        {ticker} · {period}
      </div>
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-border-subtle text-text-secondary">
            <th className="h-[26px] px-1.5 text-left font-semibold">Metric</th>
            <th className="h-[26px] px-1.5 text-right font-semibold">TTM</th>
            <th className="h-[26px] px-1.5 text-right font-semibold">YoY</th>
            <th className="h-[26px] px-1.5 text-right font-semibold">Cons.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.metric} className="border-b border-border-subtle">
              <td className="h-6 px-1.5 text-text">{r.metric}</td>
              <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums">
                {r.ttm}
              </td>
              <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums text-positive">
                {r.yoy}
              </td>
              <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums text-text-secondary">
                {r.consensus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RelativeValuationWidget({ ticker }: { ticker: string }) {
  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr className="border-b border-border-subtle text-text-secondary">
          <th className="h-[26px] px-1.5 text-left font-semibold">Peer</th>
          <th className="h-[26px] px-1.5 text-right font-semibold">P/E</th>
          <th className="h-[26px] px-1.5 text-right font-semibold">P/S</th>
          <th className="h-[26px] px-1.5 text-right font-semibold">EV/EBITDA</th>
        </tr>
      </thead>
      <tbody>
        {PEERS.map((p) => (
          <tr
            key={p.ticker}
            className={[
              'border-b border-border-subtle',
              p.ticker === ticker ? 'bg-selection-muted' : '',
            ].join(' ')}
          >
            <td className="h-6 px-1.5 font-medium">{p.ticker}</td>
            <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums">
              {p.pe == null ? 'n/m' : p.pe.toFixed(1)}
            </td>
            <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums">
              {p.ps.toFixed(1)}
            </td>
            <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums">
              {p.evEbitda.toFixed(1)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
