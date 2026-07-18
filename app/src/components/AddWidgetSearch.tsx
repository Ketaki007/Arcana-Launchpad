import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react'
import { Check } from 'lucide-react'
import {
  LAUNCHPAD_WIDGETS,
  searchWidgets,
  type WidgetDefinition,
} from '../data/widgets'

export type AddWidgetSearchHandle = {
  focus: () => void
  open: () => void
}

type AddWidgetSearchProps = {
  onAddWidget: (widget: WidgetDefinition) => void
  /** Batch add for multi-select mode. Falls back to calling onAddWidget per item. */
  onAddWidgets?: (widgets: WidgetDefinition[]) => void
  /**
   * Demo / capture helpers — force open states for walkthrough screenshots.
   * `open` = dropdown open, no typing yet, full catalog, multiselect off
   * `multi` = multiselect on + a few picked
   * `search` = multiselect off + query "n" with filtered results
   * `search-multi` = multiselect on + query "n" with filtered results
   */
  demoMode?: 'open' | 'multi' | 'search' | 'search-multi' | null
}

function highlightMatch(text: string, query: string) {
  const q = query.trim()
  if (!q) return text

  const lower = text.toLowerCase()
  const index = lower.indexOf(q.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <strong className="font-semibold text-text">
        {text.slice(index, index + q.length)}
      </strong>
      {text.slice(index + q.length)}
    </>
  )
}

function defsForIds(ids: string[]): WidgetDefinition[] {
  return ids
    .map((id) => LAUNCHPAD_WIDGETS.find((w) => w.id === id))
    .filter((w): w is WidgetDefinition => Boolean(w))
}

export const AddWidgetSearch = forwardRef<
  AddWidgetSearchHandle,
  AddWidgetSearchProps
>(function AddWidgetSearch({ onAddWidget, onAddWidgets, demoMode = null }, ref) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState(() =>
    demoMode === 'search' || demoMode === 'search-multi' ? 'n' : '',
  )
  const [open, setOpen] = useState(Boolean(demoMode))
  const [activeIndex, setActiveIndex] = useState(0)
  const [multiMode, setMultiMode] = useState(
    demoMode === 'multi' || demoMode === 'search-multi',
  )
  const [pickedIds, setPickedIds] = useState<string[]>(() =>
    demoMode === 'multi'
      ? ['watchlist', 'chart', 'news', 'financial-analysis']
      : [],
  )

  useEffect(() => {
    if (!demoMode) return
    setOpen(true)
    setMultiMode(demoMode === 'multi' || demoMode === 'search-multi')
    if (demoMode === 'multi') {
      setPickedIds(['watchlist', 'chart', 'news', 'financial-analysis'])
      setQuery('')
    } else if (demoMode === 'search' || demoMode === 'search-multi') {
      setPickedIds([])
      setQuery('n')
    } else if (demoMode === 'open') {
      setPickedIds([])
      setQuery('')
    }
    queueMicrotask(() => inputRef.current?.focus())
  }, [demoMode])

  const trimmed = query.trim()
  const hasQuery = trimmed.length > 0
  const results = useMemo(() => {
    if (
      demoMode &&
      !hasQuery &&
      demoMode !== 'search' &&
      demoMode !== 'search-multi'
    ) {
      return LAUNCHPAD_WIDGETS
    }
    return searchWidgets(query)
  }, [query, demoMode, hasQuery])

  /** Selected widgets stay pinned on top in multiselect, even with an empty query. */
  const pinned = useMemo(
    () => (multiMode ? defsForIds(pickedIds) : []),
    [multiMode, pickedIds],
  )
  const displayList = useMemo(() => {
    if (!multiMode || pinned.length === 0) return results
    const pinnedIds = new Set(pinned.map((w) => w.id))
    const rest = results.filter((w) => !pinnedIds.has(w.id))
    return [...pinned, ...rest]
  }, [multiMode, pinned, results])

  const isActive = open || query.length > 0 || multiMode

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    open: () => {
      setOpen(true)
      inputRef.current?.focus()
    },
  }))

  useEffect(() => {
    setActiveIndex(0)
  }, [query, multiMode, displayList.length])

  useEffect(() => {
    if (!open || demoMode) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        if (!multiMode) setQuery('')
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [open, multiMode, demoMode])

  function resetTransient() {
    setQuery('')
    setPickedIds([])
    setOpen(false)
    inputRef.current?.blur()
  }

  function addSingle(widget: WidgetDefinition) {
    onAddWidget(widget)
    resetTransient()
  }

  function togglePick(widget: WidgetDefinition) {
    setPickedIds((prev) =>
      prev.includes(widget.id)
        ? prev.filter((id) => id !== widget.id)
        : [...prev, widget.id],
    )
  }

  function commitMulti() {
    const defs = defsForIds(pickedIds)
    if (defs.length === 0) return
    if (onAddWidgets) onAddWidgets(defs)
    else defs.forEach((d) => onAddWidget(d))
    setMultiMode(false)
    resetTransient()
  }

  function onRowActivate(widget: WidgetDefinition) {
    if (multiMode) togglePick(widget)
    else addSingle(widget)
  }

  function setMultiSelect(on: boolean) {
    setMultiMode(on)
    if (!on) setPickedIds([])
    else setOpen(true)
  }

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  const shortcutKeys = isMac ? (['⌘', '⇧', 'W'] as const) : (['⌃', '⇧', 'W'] as const)
  const shortcutHint = shortcutKeys.join('')

  return (
    <div ref={rootRef} className="relative flex items-center">
      <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="Add widget(s)"
        aria-label="Add widget(s)"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        role="combobox"
        title={`Add widget (${shortcutHint})`}
        className={[
          'h-6 w-[248px] rounded-[2px] border py-0 pl-2 pr-[4.25rem] text-[11px] outline-none transition-colors',
          isActive
            ? 'border-[#c47a2e] bg-[#e8873a] text-black placeholder:text-black/55'
            : 'border-border bg-[#e8873a]/90 text-black placeholder:text-black/70 hover:bg-[#e8873a]',
        ].join(' ')}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            setActiveIndex((i) =>
              Math.min(i + 1, Math.max(displayList.length - 1, 0)),
            )
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, 0))
          } else if (e.key === 'Enter') {
            e.preventDefault()
            if (multiMode) {
              if (e.metaKey || e.ctrlKey) {
                commitMulti()
                return
              }
              const widget = displayList[activeIndex]
              if (widget) togglePick(widget)
              return
            }
            const widget = displayList[activeIndex]
            if (widget) addSingle(widget)
          } else if (e.key === 'Escape') {
            if (multiMode && pickedIds.length > 0) {
              setPickedIds([])
              return
            }
            if (multiMode) {
              setMultiSelect(false)
              return
            }
            setOpen(false)
            setQuery('')
            inputRef.current?.blur()
          }
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-[2px] bg-black/20 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-black/80"
      >
        {shortcutKeys.map((key) => (
          <span key={key} className="inline-block min-w-[0.7em] text-center">
            {key}
          </span>
        ))}
      </span>
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable={multiMode || undefined}
          className="absolute left-0 top-full z-50 mt-0.5 w-[360px] rounded-[2px] border border-border bg-panel py-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center gap-2 border-b border-border-subtle px-2.5 py-1.5">
            <span className="min-w-0 flex-1 whitespace-nowrap text-[10px] text-text-muted">
              {multiMode && pickedIds.length > 0
                ? `${pickedIds.length} selected`
                : !hasQuery
                  ? 'Type a name or shortform (e.g. Chart, VQ, NEWS)'
                  : 'Results'}
            </span>
            <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5">
              <span className="whitespace-nowrap text-[10px] font-medium text-text-secondary">
                Multiselect
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={multiMode}
                aria-label="Multiselect"
                title="Multiselect — pick several widgets, then Add"
                onClick={() => setMultiSelect(!multiMode)}
                className={[
                  'relative h-3.5 w-6 shrink-0 rounded-[2px] transition-colors',
                  multiMode ? 'bg-selection' : 'bg-white/15',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 h-2.5 w-2.5 rounded-[2px] bg-white transition-[left]',
                    multiMode ? 'left-3' : 'left-0.5',
                  ].join(' ')}
                />
              </button>
            </label>
          </div>

          {displayList.length === 0 ? (
            hasQuery ? (
              <div className="px-2.5 py-2 text-[11px] text-text-muted">
                No widgets match “{query}”
              </div>
            ) : null
          ) : (
            <>
              {multiMode && pinned.length > 0 ? (
                <div className="px-2.5 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                  Selected
                </div>
              ) : null}
              {displayList.map((widget, index) => {
                const highlighted = index === activeIndex
                const checked = pickedIds.includes(widget.id)
                const isPinned =
                  multiMode && checked && index < pinned.length
                // Section label once between pinned and search hits
                const showResultsLabel =
                  multiMode &&
                  pinned.length > 0 &&
                  index === pinned.length &&
                  hasQuery

                return (
                  <div key={widget.id}>
                    {showResultsLabel ? (
                      <div className="px-2.5 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-text-muted">
                        Results
                      </div>
                    ) : null}
                    <button
                      type="button"
                      role="option"
                      aria-selected={multiMode ? checked : highlighted}
                      className={[
                        'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px]',
                        highlighted
                          ? 'bg-selection text-white'
                          : isPinned
                            ? 'bg-white/[0.04] text-text'
                            : 'text-text-secondary hover:bg-white/[0.04] hover:text-text',
                      ].join(' ')}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => onRowActivate(widget)}
                    >
                      {multiMode ? (
                        <span
                          className={[
                            'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border',
                            checked
                              ? highlighted
                                ? 'border-white bg-white text-selection'
                                : 'border-selection bg-selection text-white'
                              : highlighted
                                ? 'border-white/70'
                                : 'border-border',
                          ].join(' ')}
                        >
                          {checked ? (
                            <Check size={10} strokeWidth={3} />
                          ) : null}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 truncate">
                        {highlightMatch(widget.name, query)}
                        {widget.shortform ? (
                          <span
                            className={
                              highlighted
                                ? 'text-white/70'
                                : 'text-text-muted'
                            }
                          >
                            {' '}
                            ({highlightMatch(widget.shortform, query)})
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </div>
                )
              })}
            </>
          )}

          {multiMode ? (
            <div className="mt-0.5 flex items-center justify-end gap-2 border-t border-border-subtle px-2 py-1.5">
              <button
                type="button"
                disabled={pickedIds.length === 0}
                className="inline-flex h-6 items-center rounded-[2px] bg-selection px-2.5 text-[11px] font-medium text-white enabled:hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={commitMulti}
              >
                Add{pickedIds.length > 0 ? ` ${pickedIds.length}` : ''}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
})
