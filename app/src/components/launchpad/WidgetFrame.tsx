import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  Link2,
  Link2Off,
  Settings2,
  X,
  Maximize2,
  GripVertical,
  SquareArrowOutUpRight,
  Monitor,
} from 'lucide-react'
import {
  type LinkGroupDef,
  type PlacedWidget,
  type WidgetLinkGroup,
} from '../../data/launchpadModel'
import { SECURITIES } from '../../data/market'
import {
  WatchlistWidget,
  QuoteMonitorWidget,
  VerticalQuoteWidget,
  DescriptionWidget,
  NewsWidget,
  ChartWidget,
  FinancialAnalysisWidget,
  RelativeValuationWidget,
} from './widgets/BasicWidgets'
import {
  NewsFeedWidget,
  GraphicDashboardWidget,
  WorldEquityIndicesWidget,
  InternationalClockWidget,
} from './widgets/TerminalWidgets'
import { OpaqueSelect } from '../ui/OpaqueSelect'
import {
  CONFIGURABLE_WIDGET_IDS,
  WidgetConfigMenu,
} from './WidgetConfigPanel'
import { setResearchDragData } from '../../lib/researchDnD'

/** Widgets that always expose a security picker in the header. */
const SECURITY_PICKER_IDS = new Set([
  'chart',
  'quote-monitor',
  'description',
  'financial-analysis',
  'relative-valuation',
  'graphic-dashboard',
  'news-feed',
  'vertical-quote',
])

/** Per-widget security — dropdown never broadcasts to other widgets. */
function resolveWidgetTicker(
  widget: PlacedWidget,
  selectedTicker: string,
): string {
  return widget.config.security || selectedTicker
}

type WidgetFrameProps = {
  widget: PlacedWidget
  selectedTicker: string
  maximized: boolean
  dragging: boolean
  onSelectTicker: (ticker: string) => void
  onRemove: () => void
  linkGroups: LinkGroupDef[]
  onSetLinkGroup: (group: WidgetLinkGroup) => void
  onCreateLinkGroup: () => void
  onManageLinkGroups: () => void
  onConfigReset?: () => void
  onMaximize: () => void
  onOpenInScreen?: (screen: 1 | 2) => void
  onConfigChange: (key: string, value: string) => void
  onLayoutChange: (layout: {
    x?: number
    y?: number
    width?: number
    height?: number
  }) => void
  onMoveStart: (instanceId: string) => void
  onMoveEnd: () => void
  onResizeEnd?: () => void
  /** Demo / capture: keep the link-group menu open. */
  forceLinkMenuOpen?: boolean
}

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const MIN_W = 280
const MIN_H = 160
const MAX_W = 2400
const MAX_H = 2400

const RESIZE_CURSORS: Record<ResizeEdge, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
}

export function WidgetFrame({
  widget,
  selectedTicker,
  maximized,
  dragging,
  onSelectTicker,
  onRemove,
  linkGroups,
  onSetLinkGroup,
  onCreateLinkGroup,
  onManageLinkGroups,
  onConfigReset,
  onMaximize,
  onOpenInScreen,
  onConfigChange,
  onLayoutChange,
  onMoveStart,
  onMoveEnd,
  onResizeEnd,
  forceLinkMenuOpen = false,
}: WidgetFrameProps) {
  const [configOpen, setConfigOpen] = useState(false)
  const configBtnRef = useRef<HTMLButtonElement>(null)
  const moveRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)
  const resizeRef = useRef<{
    edge: ResizeEdge
    startX: number
    startY: number
    originX: number
    originY: number
    originW: number
    originH: number
  } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (moveRef.current) {
        const dx = e.clientX - moveRef.current.startX
        const dy = e.clientY - moveRef.current.startY
        onLayoutChange({
          x: Math.max(0, moveRef.current.originX + dx),
          y: Math.max(0, moveRef.current.originY + dy),
        })
        return
      }
      if (resizeRef.current) {
        const {
          edge,
          startX,
          startY,
          originX,
          originY,
          originW,
          originH,
        } = resizeRef.current
        const dw = e.clientX - startX
        const dh = e.clientY - startY

        let x = originX
        let y = originY
        let width = originW
        let height = originH

        if (edge.includes('e')) {
          width = Math.max(MIN_W, Math.min(MAX_W, originW + dw))
        }
        if (edge.includes('s')) {
          height = Math.max(MIN_H, Math.min(MAX_H, originH + dh))
        }
        if (edge.includes('w')) {
          width = Math.max(MIN_W, Math.min(MAX_W, originW - dw))
          x = originX + (originW - width)
        }
        if (edge.includes('n')) {
          height = Math.max(MIN_H, Math.min(MAX_H, originH - dh))
          y = Math.max(0, originY + (originH - height))
        }

        onLayoutChange({ x, y, width, height })
      }
    }
    const onUp = () => {
      if (moveRef.current) {
        moveRef.current = null
        onMoveEnd()
      }
      if (resizeRef.current) {
        resizeRef.current = null
        onResizeEnd?.()
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [onLayoutChange, onMoveEnd, onResizeEnd])

  function startResize(edge: ResizeEdge, e: ReactMouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      edge,
      startX: e.clientX,
      startY: e.clientY,
      originX: widget.x,
      originY: widget.y,
      originW: widget.width,
      originH: widget.height,
    }
  }

  if (maximized) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2px] border border-border bg-panel">
        <WidgetHeader
          widget={widget}
          selectedTicker={selectedTicker}
          onSelectTicker={onSelectTicker}
          linkGroups={linkGroups}
          onSetLinkGroup={onSetLinkGroup}
          onCreateLinkGroup={onCreateLinkGroup}
          onManageLinkGroups={onManageLinkGroups}
          configOpen={configOpen}
          onConfigOpenChange={setConfigOpen}
          configBtnRef={configBtnRef}
          onMaximize={onMaximize}
          onRemove={onRemove}
          onConfigChange={onConfigChange}
          onConfigReset={onConfigReset}
        />
        <div className="min-h-0 flex-1 overflow-auto">
          <WidgetBody
            widget={widget}
            selectedTicker={selectedTicker}
            onSelectTicker={onSelectTicker}
          />
        </div>
      </section>
    )
  }

  return (
    <section
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: dragging
          ? 40
          : configOpen || forceLinkMenuOpen
            ? 50
            : widget.floating
              ? 15
              : 1,
      }}
      className={[
        'flex flex-col rounded-[2px] border border-border bg-panel shadow-[0_2px_12px_rgba(0,0,0,0.35)]',
        forceLinkMenuOpen || configOpen
          ? 'overflow-visible'
          : 'overflow-hidden',
        dragging ? 'opacity-95' : '',
      ].join(' ')}
    >
      <header
        className="flex h-[30px] shrink-0 cursor-grab items-center gap-1 border-b border-border-subtle bg-panel-header px-1.5 active:cursor-grabbing"
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button, select, input')) return
          e.preventDefault()
          onMoveStart(widget.instanceId)
          moveRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            originX: widget.x,
            originY: widget.y,
          }
        }}
      >
        <span
          className="inline-flex h-6 w-5 items-center justify-center text-text-muted"
          aria-hidden
        >
          <GripVertical size={13} />
        </span>

        <h3
          draggable
          title="Drag into Research Notes"
          onMouseDown={(e) => e.stopPropagation()}
          onDragStart={(e) => {
            e.stopPropagation()
            const ticker = resolveWidgetTicker(widget, selectedTicker)
            setResearchDragData(e, {
              kind: 'widget',
              title: widget.name,
              detail: `${ticker}${widget.shortform ? ` · ${widget.shortform}` : ''}`,
              source: widget.name,
            })
          }}
          className="min-w-0 shrink cursor-grab truncate text-[13px] font-semibold text-text active:cursor-grabbing"
        >
          {widget.name}
          {widget.shortform ? (
            <span className="ml-1.5 text-[11px] font-normal text-text-muted">
              {widget.shortform}
            </span>
          ) : null}
        </h3>

        {SECURITY_PICKER_IDS.has(widget.id) ? (
          <div
            className="min-w-0 flex-1"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <SecuritySelect
              widget={widget}
              selectedTicker={selectedTicker}
              onConfigChange={onConfigChange}
            />
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <div
          className="flex shrink-0 items-center gap-0.5"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <InlineControls widget={widget} onConfigChange={onConfigChange} />
          <LinkGroupControl
            linkGroup={widget.linkGroup}
            linkGroups={linkGroups}
            onSetLinkGroup={onSetLinkGroup}
            onCreateLinkGroup={onCreateLinkGroup}
            onManageLinkGroups={onManageLinkGroups}
            forceOpen={forceLinkMenuOpen}
          />
          {CONFIGURABLE_WIDGET_IDS.has(widget.id) ? (
            <>
              <IconButton
                ref={configBtnRef}
                title="Configure"
                aria-haspopup="dialog"
                aria-expanded={configOpen}
                onClick={() => setConfigOpen((v) => !v)}
                className={
                  configOpen
                    ? 'text-selection'
                    : 'text-text-muted hover:text-text'
                }
              >
                <Settings2 size={12} />
              </IconButton>
              {configOpen ? (
                <WidgetConfigMenu
                  widget={widget}
                  anchorEl={configBtnRef.current}
                  onClose={() => setConfigOpen(false)}
                  onChange={onConfigChange}
                  onReset={() => onConfigReset?.()}
                />
              ) : null}
            </>
          ) : null}
          <OpenElsewhereMenu onOpenInScreen={onOpenInScreen} />
          <IconButton
            title="Remove"
            onClick={onRemove}
            className="text-text-muted hover:text-negative"
          >
            <X size={12} />
          </IconButton>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <WidgetBody
          widget={widget}
          selectedTicker={selectedTicker}
          onSelectTicker={onSelectTicker}
        />
      </div>

      {/* Edge handles */}
      <ResizeHandle edge="n" onMouseDown={startResize} />
      <ResizeHandle edge="s" onMouseDown={startResize} />
      <ResizeHandle edge="e" onMouseDown={startResize} />
      <ResizeHandle edge="w" onMouseDown={startResize} />
      {/* Corner handles */}
      <ResizeHandle edge="ne" onMouseDown={startResize} />
      <ResizeHandle edge="nw" onMouseDown={startResize} />
      <ResizeHandle edge="se" onMouseDown={startResize} />
      <ResizeHandle edge="sw" onMouseDown={startResize} />
    </section>
  )
}

type OpenElsewhereAction = 'screen1' | 'screen2'

const OPEN_ELSEWHERE_OPTIONS: {
  id: OpenElsewhereAction
  label: string
  icon: ReactNode
}[] = [
  {
    id: 'screen1',
    label: 'Open in screen 1',
    icon: <Monitor size={12} />,
  },
  {
    id: 'screen2',
    label: 'Open in screen 2',
    icon: <Monitor size={12} />,
  },
]

function OpenElsewhereMenu({
  onOpenInScreen,
}: {
  onOpenInScreen?: (screen: 1 | 2) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const closeTimer = useRef<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const clearClose = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    clearClose()
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  const openMenu = (index = 0) => {
    clearClose()
    setActiveIndex(index)
    setOpen(true)
  }

  const closeMenu = () => {
    clearClose()
    setOpen(false)
  }

  const runAction = (id: OpenElsewhereAction) => {
    closeMenu()
    if (id === 'screen1') onOpenInScreen?.(1)
    else onOpenInScreen?.(2)
  }

  useEffect(() => () => clearClose(), [])

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => openMenu(activeIndex)}
      onMouseLeave={scheduleClose}
    >
      <IconButton
        title="Open elsewhere"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-activedescendant={
          open ? `${menuId}-opt-${activeIndex}` : undefined
        }
        onFocus={() => openMenu(0)}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null
          if (next && rootRef.current?.contains(next)) return
          closeMenu()
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            e.stopPropagation()
            if (!open) {
              openMenu(e.key === 'ArrowUp' ? OPEN_ELSEWHERE_OPTIONS.length - 1 : 0)
              return
            }
            setActiveIndex((i) => {
              const len = OPEN_ELSEWHERE_OPTIONS.length
              return e.key === 'ArrowDown'
                ? (i + 1) % len
                : (i - 1 + len) % len
            })
            return
          }
          if (e.key === 'Home') {
            e.preventDefault()
            openMenu(0)
            return
          }
          if (e.key === 'End') {
            e.preventDefault()
            openMenu(OPEN_ELSEWHERE_OPTIONS.length - 1)
            return
          }
          if (e.key === 'Enter' || e.key === ' ') {
            if (!open) {
              e.preventDefault()
              openMenu(0)
              return
            }
            e.preventDefault()
            e.stopPropagation()
            runAction(OPEN_ELSEWHERE_OPTIONS[activeIndex]!.id)
            return
          }
          if (e.key === 'Escape') {
            e.preventDefault()
            closeMenu()
          }
        }}
      >
        <SquareArrowOutUpRight size={11} />
      </IconButton>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-0.5 min-w-[168px] rounded-[2px] border border-border bg-panel py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
          onMouseEnter={clearClose}
          onMouseLeave={scheduleClose}
        >
          {OPEN_ELSEWHERE_OPTIONS.map((opt, index) => (
            <OpenElsewhereItem
              key={opt.id}
              id={`${menuId}-opt-${index}`}
              icon={opt.icon}
              label={opt.label}
              active={index === activeIndex}
              onHover={() => setActiveIndex(index)}
              onClick={() => runAction(opt.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function OpenElsewhereItem({
  id,
  icon,
  label,
  active,
  onHover,
  onClick,
}: {
  id: string
  icon: ReactNode
  label: string
  active: boolean
  onHover: () => void
  onClick: () => void
}) {
  return (
    <button
      type="button"
      id={id}
      role="menuitem"
      tabIndex={-1}
      onMouseEnter={onHover}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px]',
        active ? 'bg-panel-header text-text' : 'text-text hover:bg-panel-header',
      ].join(' ')}
    >
      <span className="text-text-muted">{icon}</span>
      {label}
    </button>
  )
}

function ResizeHandle({
  edge,
  onMouseDown,
}: {
  edge: ResizeEdge
  onMouseDown: (edge: ResizeEdge, e: ReactMouseEvent) => void
}) {
  const isCorner = edge.length === 2
  const position: Record<ResizeEdge, string> = {
    n: 'left-3 right-3 top-0 h-1.5',
    s: 'left-3 right-3 bottom-0 h-1.5',
    e: 'top-3 bottom-3 right-0 w-1.5',
    w: 'top-3 bottom-3 left-0 w-1.5',
    ne: 'right-0 top-0 h-3 w-3',
    nw: 'left-0 top-0 h-3 w-3',
    se: 'right-0 bottom-0 h-3.5 w-3.5',
    sw: 'left-0 bottom-0 h-3 w-3',
  }

  return (
    <div
      role="separator"
      aria-label={`Resize ${edge}`}
      title="Drag to resize"
      className={`absolute z-10 ${position[edge]}`}
      style={{ cursor: RESIZE_CURSORS[edge] }}
      onMouseDown={(e) => onMouseDown(edge, e)}
    >
      {edge === 'se' ? (
        <span className="absolute bottom-1 right-1 h-2 w-2 border-b border-r border-text-muted" />
      ) : isCorner ? (
        <span className="absolute inset-0.5 rounded-[1px] opacity-0 hover:opacity-40 hover:bg-text-muted" />
      ) : null}
    </div>
  )
}

function WidgetHeader({
  widget,
  selectedTicker,
  onSelectTicker,
  linkGroups,
  onSetLinkGroup,
  onCreateLinkGroup,
  onManageLinkGroups,
  configOpen,
  onConfigOpenChange,
  configBtnRef,
  onMaximize,
  onRemove,
  onConfigChange,
  onConfigReset,
}: {
  widget: PlacedWidget
  selectedTicker: string
  onSelectTicker: (ticker: string) => void
  linkGroups: LinkGroupDef[]
  onSetLinkGroup: (group: WidgetLinkGroup) => void
  onCreateLinkGroup: () => void
  onManageLinkGroups: () => void
  configOpen: boolean
  onConfigOpenChange: (open: boolean) => void
  configBtnRef: RefObject<HTMLButtonElement | null>
  onMaximize: () => void
  onRemove: () => void
  onConfigChange: (key: string, value: string) => void
  onConfigReset?: () => void
}) {
  return (
    <header className="flex h-[30px] shrink-0 items-center gap-1 border-b border-border-subtle bg-panel-header px-2">
      <h3
        draggable
        title="Drag into Research Notes"
        onDragStart={(e) => {
          const ticker = resolveWidgetTicker(widget, selectedTicker)
          setResearchDragData(e, {
            kind: 'widget',
            title: widget.name,
            detail: `${ticker}${widget.shortform ? ` · ${widget.shortform}` : ''}`,
            source: widget.name,
          })
        }}
        className="min-w-0 shrink cursor-grab truncate text-[13px] font-semibold active:cursor-grabbing"
      >
        {widget.name}
      </h3>
      {SECURITY_PICKER_IDS.has(widget.id) ? (
        <div className="min-w-0 flex-1">
          <SecuritySelect
            widget={widget}
            selectedTicker={selectedTicker}
            onConfigChange={onConfigChange}
          />
        </div>
      ) : (
        <div className="min-w-0 flex-1" />
      )}
      <div className="flex shrink-0 items-center gap-0.5">
        <InlineControls widget={widget} onConfigChange={onConfigChange} />
        <LinkGroupControl
          linkGroup={widget.linkGroup}
          linkGroups={linkGroups}
          onSetLinkGroup={onSetLinkGroup}
          onCreateLinkGroup={onCreateLinkGroup}
          onManageLinkGroups={onManageLinkGroups}
        />
        {CONFIGURABLE_WIDGET_IDS.has(widget.id) ? (
          <>
            <IconButton
              ref={configBtnRef}
              title="Configure"
              aria-haspopup="dialog"
              aria-expanded={configOpen}
              onClick={() => onConfigOpenChange(!configOpen)}
              className={
                configOpen
                  ? 'text-selection'
                  : 'text-text-muted hover:text-text'
              }
            >
              <Settings2 size={12} />
            </IconButton>
            {configOpen ? (
              <WidgetConfigMenu
                widget={widget}
                anchorEl={configBtnRef.current}
                onClose={() => onConfigOpenChange(false)}
                onChange={onConfigChange}
                onReset={() => onConfigReset?.()}
              />
            ) : null}
          </>
        ) : null}
        <IconButton title="Restore" onClick={onMaximize}>
          <Maximize2 size={11} />
        </IconButton>
        <IconButton title="Remove" onClick={onRemove}>
          <X size={12} />
        </IconButton>
      </div>
    </header>
  )
}

function LinkGroupControl({
  linkGroup,
  linkGroups,
  onSetLinkGroup,
  onCreateLinkGroup,
  onManageLinkGroups,
  forceOpen = false,
}: {
  linkGroup: WidgetLinkGroup
  linkGroups: LinkGroupDef[]
  onSetLinkGroup: (group: WidgetLinkGroup) => void
  onCreateLinkGroup: () => void
  onManageLinkGroups: () => void
  forceOpen?: boolean
}) {
  const [open, setOpen] = useState(forceOpen)
  const rootRef = useRef<HTMLDivElement>(null)
  const activeGroup = linkGroups.find((g) => g.id === linkGroup) ?? null

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  useEffect(() => {
    if (!open || forceOpen) return
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
  }, [open, forceOpen])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        title="Link group"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-6 items-center gap-1 rounded-[2px] px-1 text-text-muted hover:bg-white/[0.05] hover:text-text"
        style={
          activeGroup
            ? { color: activeGroup.color }
            : undefined
        }
      >
        {activeGroup ? <Link2 size={12} /> : <Link2Off size={12} />}
        {activeGroup ? (
          <span
            className="inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-[2px] px-1 text-[9px] font-bold leading-none text-black"
            style={{ backgroundColor: activeGroup.color }}
          >
            {activeGroup.shortLabel}
          </span>
        ) : (
          <span className="text-[10px] font-medium leading-none text-text-muted">
            None
          </span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-0.5 min-w-[168px] rounded-[2px] border border-border bg-panel py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Linked to
          </div>
          {linkGroups.map((group) => {
            const active = linkGroup === group.id
            return (
              <button
                key={group.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onSetLinkGroup(group.id)
                  setOpen(false)
                }}
                className={[
                  'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] hover:bg-panel-header',
                  active ? 'text-text' : 'text-text-secondary',
                ].join(' ')}
              >
                <span
                  className="inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-[2px] px-1 text-[9px] font-bold text-black"
                  style={{ backgroundColor: group.color }}
                >
                  {group.shortLabel}
                </span>
                <span className="truncate">{group.name}</span>
              </button>
            )
          })}
          <button
            type="button"
            role="menuitemradio"
            aria-checked={linkGroup == null}
            onClick={() => {
              onSetLinkGroup(null)
              setOpen(false)
            }}
            className={[
              'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] hover:bg-panel-header',
              linkGroup == null ? 'text-text' : 'text-text-secondary',
            ].join(' ')}
          >
            <Link2Off size={12} className="text-text-muted" />
            None
          </button>

          <div className="my-0.5 border-t border-border-subtle" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onCreateLinkGroup()
            }}
            className="flex w-full items-center px-2.5 py-1.5 text-left text-[11px] text-text hover:bg-panel-header"
          >
            Create new group
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onManageLinkGroups()
            }}
            className="flex w-full items-center px-2.5 py-1.5 text-left text-[11px] text-text hover:bg-panel-header"
          >
            Manage groups and linkages
          </button>
        </div>
      ) : null}
    </div>
  )
}

function SecuritySelect({
  widget,
  selectedTicker,
  onConfigChange,
}: {
  widget: PlacedWidget
  selectedTicker: string
  onConfigChange: (key: string, value: string) => void
}) {
  const value = resolveWidgetTicker(widget, selectedTicker)
  return (
    <OpaqueSelect
      aria-label="Select security"
      title="Changes this widget only"
      className="ml-1 min-w-0 max-w-[200px]"
      value={value}
      onChange={(next) => onConfigChange('security', next)}
      options={SECURITIES.map((s) => ({
        value: s.ticker,
        label: `${s.ticker} — ${s.name}`,
      }))}
    />
  )
}

const IconButton = forwardRef<
  HTMLButtonElement,
  {
    title: string
    onClick?: () => void
    children: ReactNode
    className?: string
  } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'title' | 'onClick' | 'children' | 'className' | 'type'
  >
>(function IconButton(
  {
    title,
    onClick,
    children,
    className = 'text-text-muted hover:text-text',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-[2px] ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
})

function InlineControls({
  widget,
  onConfigChange,
}: {
  widget: PlacedWidget
  onConfigChange: (key: string, value: string) => void
}) {
  if (widget.id === 'chart') {
    return (
      <OpaqueSelect
        className="mr-1"
        triggerClassName="text-text-secondary"
        aria-label="Chart timeframe"
        value={widget.config.timeframe ?? '1Y'}
        onChange={(next) => onConfigChange('timeframe', next)}
        options={['1D', '1W', '1M', '3M', '1Y', '5Y'].map((t) => ({
          value: t,
          label: t,
        }))}
      />
    )
  }
  if (widget.id === 'news') {
    return (
      <OpaqueSelect
        className="mr-1"
        triggerClassName="text-text-secondary"
        aria-label="News filter"
        value={widget.config.filter ?? 'All'}
        onChange={(next) => onConfigChange('filter', next)}
        options={['All', 'Selected', 'Related'].map((t) => ({
          value: t,
          label: t,
        }))}
      />
    )
  }
  if (widget.id === 'financial-analysis') {
    return (
      <OpaqueSelect
        className="mr-1"
        triggerClassName="text-text-secondary"
        aria-label="Financial period"
        value={widget.config.period ?? 'Quarterly'}
        onChange={(next) => onConfigChange('period', next)}
        options={['Quarterly', 'Annual', 'TTM'].map((t) => ({
          value: t,
          label: t,
        }))}
      />
    )
  }
  return null
}

function WidgetBody({
  widget,
  selectedTicker,
  onSelectTicker,
}: {
  widget: PlacedWidget
  selectedTicker: string
  onSelectTicker: (ticker: string) => void
}) {
  const ticker = resolveWidgetTicker(widget, selectedTicker)

  switch (widget.id) {
    case 'watchlist':
      return (
        <WatchlistWidget
          selectedTicker={selectedTicker}
          onSelect={onSelectTicker}
        />
      )
    case 'quote-monitor':
      return <QuoteMonitorWidget ticker={ticker} />
    case 'vertical-quote':
      return <VerticalQuoteWidget ticker={ticker} />
    case 'description':
      return <DescriptionWidget ticker={ticker} />
    case 'news':
      return (
        <NewsWidget ticker={ticker} filter={widget.config.filter} />
      )
    case 'news-feed':
      return <NewsFeedWidget ticker={ticker} />
    case 'chart':
      return (
        <ChartWidget
          ticker={ticker}
          timeframe={widget.config.timeframe}
          chartType={widget.config.style}
          compare={widget.config.compare}
        />
      )
    case 'graphic-dashboard':
      return <GraphicDashboardWidget ticker={ticker} />
    case 'world-equity-indices':
      return <WorldEquityIndicesWidget />
    case 'international-clock':
      return <InternationalClockWidget cities={widget.config.cities} />
    case 'financial-analysis':
      return (
        <FinancialAnalysisWidget
          ticker={ticker}
          period={widget.config.period}
        />
      )
    case 'relative-valuation':
      return <RelativeValuationWidget ticker={ticker} />
    default:
      return (
        <div className="p-3 text-[11px] text-text-muted">Unsupported widget</div>
      )
  }
}
