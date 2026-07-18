import type { CSSProperties } from 'react'
import {
  Pencil,
  Move,
  X,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react'
import type { FactorTable } from '../data/mockFactors'

type FactorTableWidgetProps = {
  table: FactorTable
  selected?: boolean
  onSelect?: () => void
}

function zScoreStyle(value: number): CSSProperties {
  const intensity = Math.min(Math.abs(value) / 3, 1)
  if (value > 0.15) {
    return {
      backgroundColor: `rgba(34, 197, 94, ${0.18 + intensity * 0.55})`,
      color: '#e8e8e8',
    }
  }
  if (value < -0.15) {
    return {
      backgroundColor: `rgba(239, 68, 68, ${0.18 + intensity * 0.55})`,
      color: '#e8e8e8',
    }
  }
  return {
    backgroundColor: 'transparent',
    color: '#a3a3a3',
  }
}

function formatPct(value: number) {
  const sign = value > 0 ? '' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function FactorTableWidget({
  table,
  selected = false,
  onSelect,
}: FactorTableWidgetProps) {
  return (
    <section
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect?.()
      }}
      className={[
        'flex min-h-0 flex-col overflow-hidden rounded-[2px] border bg-panel outline-none',
        selected
          ? 'border-selection border-dashed'
          : 'border-border hover:border-[#3a3a3a]',
      ].join(' ')}
    >
      <header className="flex h-[30px] shrink-0 items-center gap-2 border-b border-border-subtle bg-panel-header px-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <h3 className="truncate text-[13px] font-semibold text-text">
            {table.title}
          </h3>
          <button
            type="button"
            className="text-text-muted hover:text-text"
            aria-label="Rename table"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil size={11} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="inline-flex h-6 items-center gap-1 px-1.5 text-[11px] text-text-secondary hover:text-text"
            onClick={(e) => e.stopPropagation()}
          >
            <Move size={11} strokeWidth={1.75} />
            Move
          </button>
          <button
            type="button"
            className="inline-flex h-6 items-center gap-1 px-1.5 text-[11px] text-text-secondary hover:text-text"
            onClick={(e) => e.stopPropagation()}
          >
            <X size={11} strokeWidth={1.75} />
            Remove
          </button>
          <button
            type="button"
            className="inline-flex h-6 items-center gap-0.5 px-1.5 text-[11px] text-selection hover:text-[#60a5fa]"
            onClick={(e) => e.stopPropagation()}
          >
            Open Table
            <ChevronRight size={12} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="h-[26px] w-7 px-1.5 text-left font-semibold text-text-muted" />
              <th className="h-[26px] px-1.5 text-left font-semibold text-text-secondary">
                Name
              </th>
              <th className="h-[26px] px-1.5 text-right font-semibold text-text-secondary whitespace-nowrap">
                Total Returns % Change (1d)
              </th>
              <th className="h-[26px] bg-[#1e3a5f]/30 px-1.5 text-right font-semibold text-[#93c5fd] whitespace-nowrap">
                Total Returns Z-score % (t252d)
              </th>
              <th className="h-[26px] w-16 px-1.5 text-center font-semibold text-text-muted">
                + Metric
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr
                key={row.id}
                className="border-b border-border-subtle hover:bg-white/[0.02]"
              >
                <td className="h-6 px-1.5 text-text-muted tabular-nums">
                  {index + 1}
                </td>
                <td className="h-6 px-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-text">{row.name}</span>
                    <button
                      type="button"
                      className="shrink-0 text-text-muted hover:text-text"
                      aria-label={`Edit ${row.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil size={10} strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      className="shrink-0 text-negative/70 hover:text-negative"
                      aria-label={`Remove ${row.name}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={10} strokeWidth={1.75} />
                    </button>
                  </div>
                </td>
                <td className="h-6 px-1.5 text-right font-mono text-[11px] tabular-nums text-text">
                  {formatPct(row.change1d)}
                </td>
                <td
                  className="h-6 px-1.5 text-right font-mono text-[11px] font-medium tabular-nums"
                  style={zScoreStyle(row.zScore)}
                >
                  {row.zScore.toFixed(1)}
                </td>
                <td className="h-6 px-1.5" />
              </tr>
            ))}
            <tr>
              <td colSpan={5} className="h-7 px-1.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[12px] text-text-muted hover:text-text"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus size={12} strokeWidth={2} />
                  New Asset
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
