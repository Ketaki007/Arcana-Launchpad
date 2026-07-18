import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export type OpaqueSelectOption = {
  value: string
  label: string
}

type OpaqueSelectProps = {
  value: string
  options: OpaqueSelectOption[]
  onChange: (value: string) => void
  'aria-label'?: string
  title?: string
  className?: string
  /** Extra classes for the trigger button */
  triggerClassName?: string
}

/**
 * Custom dropdown that keeps Neo’s opaque dark panel UI on all platforms
 * (avoids iOS / Safari glass system pickers from native &lt;select&gt;).
 */
export function OpaqueSelect({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  title,
  className = '',
  triggerClassName = '',
}: OpaqueSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((o) => o.value === value) ?? options[0]

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
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        title={title}
        onClick={() => setOpen((v) => !v)}
        className={[
          'inline-flex h-6 max-w-full items-center gap-1 truncate rounded-[2px] border border-border bg-panel px-1.5 text-[11px] text-text outline-none hover:border-text-muted',
          triggerClassName,
        ].join(' ')}
      >
        <span className="min-w-0 truncate text-left">
          {selected?.label ?? value}
        </span>
        <ChevronDown size={11} className="shrink-0 opacity-70" />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 top-full z-[90] mt-0.5 max-h-56 min-w-full overflow-auto rounded-[2px] border border-border bg-panel py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
        >
          {options.map((option) => {
            const isActive = option.value === value
            return (
              <li key={option.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={[
                    'flex w-full whitespace-nowrap px-2.5 py-1.5 text-left text-[11px]',
                    isActive
                      ? 'bg-selection text-white'
                      : 'text-text-secondary hover:bg-white/[0.06] hover:text-text',
                  ].join(' ')}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
