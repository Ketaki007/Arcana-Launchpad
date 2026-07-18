import { LAUNCHPAD_WIDGETS, type WidgetDefinition } from './widgets'

/**
 * Well-spaced link-group hues (skip near-neighbour shades).
 * Avoids status colours: red, green, yellow, orange.
 */
/** Nine well-spaced hues for a 3×3 picker (no red / green / yellow / orange). */
export const LINK_GROUP_COLORS = [
  '#2563eb', // royal blue
  '#7c3aed', // violet
  '#db2777', // pink
  '#0891b2', // cyan
  '#0f766e', // deep teal
  '#4f46e5', // indigo
  '#64748b', // slate
  '#c026d3', // magenta
  '#1d4ed8', // deep blue
] as const

export type LinkGroupDef = {
  id: string
  name: string
  /** 1–2 character chip label shown in the widget header */
  shortLabel: string
  color: string
}

/** Widget linkGroup is a LinkGroupDef.id, or null for None. */
export type WidgetLinkGroup = string | null

export function defaultLinkGroups(): LinkGroupDef[] {
  return [
    { id: 'lg-a', name: 'Group A', shortLabel: 'A', color: LINK_GROUP_COLORS[0] },
    { id: 'lg-b', name: 'Group B', shortLabel: 'B', color: LINK_GROUP_COLORS[1] },
    { id: 'lg-c', name: 'Group C', shortLabel: 'C', color: LINK_GROUP_COLORS[4] },
  ]
}

export function nextLinkGroupColor(existing: LinkGroupDef[]): string {
  const used = new Set(existing.map((g) => g.color))
  return (
    LINK_GROUP_COLORS.find((c) => !used.has(c)) ??
    LINK_GROUP_COLORS[existing.length % LINK_GROUP_COLORS.length]!
  )
}

export function shortLabelFromName(name: string, fallback = 'G'): string {
  const trimmed = name.trim()
  if (!trimmed) return fallback
  // "Group D" → "D" (matches seeded single-letter chips)
  const groupMatch = /^group\s+(.+)$/i.exec(trimmed)
  if (groupMatch?.[1]) {
    return (groupMatch[1].charAt(0) || fallback).toUpperCase()
  }
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return `${words[0]![0] ?? ''}${words[1]![0] ?? ''}`.toUpperCase()
  }
  return trimmed.slice(0, 1).toUpperCase()
}

export type PlacedWidget = WidgetDefinition & {
  instanceId: string
  /** LinkGroupDef.id — widgets in the same group share selection context. */
  linkGroup: WidgetLinkGroup
  x: number
  y: number
  width: number
  height: number
  config: Record<string, string>
  /** When set, this widget sticks to another and fills space on resize. */
  dock?: {
    targetId: string
    side: 'left' | 'right' | 'top' | 'bottom'
  }
  /**
   * Overlays the tiled layout when the visible workspace has no room
   * for another row/column. Cleared when the user docks it via snap.
   */
  floating?: boolean
}

export type LaunchpadPage = {
  id: string
  name: string
  widgets: PlacedWidget[]
  linkGroups: LinkGroupDef[]
}

export type LaunchpadView = {
  id: string
  name: string
  pages: LaunchpadPage[]
}

export type WorkspaceTemplate = {
  id: string
  name: string
  description: string
  widgetIds: string[]
}

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'company-research',
    name: 'Company Research',
    description: 'Overview, fundamentals, valuation, news and chart',
    widgetIds: [
      'watchlist',
      'description',
      'financial-analysis',
      'relative-valuation',
      'news',
      'chart',
    ],
  },
  {
    id: 'earnings-review',
    name: 'Earnings Review',
    description: 'Monitor, DES, NEWS, GP, FA, RV',
    widgetIds: [
      'quote-monitor',
      'description',
      'news',
      'chart',
      'financial-analysis',
      'relative-valuation',
    ],
  },
  {
    id: 'peer-comparison',
    name: 'Peer Comparison',
    description: 'Watchlist with relative valuation and chart',
    widgetIds: ['watchlist', 'relative-valuation', 'chart', 'financial-analysis'],
  },
  {
    id: 'market-monitoring',
    name: 'Market Monitoring',
    description: 'Live quotes, chart and news',
    widgetIds: ['watchlist', 'quote-monitor', 'chart', 'news'],
  },
]

const DEFAULT_WIDGET_WIDTH = 460
const DEFAULT_WIDGET_HEIGHT = 280
const WIDGET_GAP = 8
/** Half-gutter at canvas edges so outer margins match gutter centers between widgets. */
const CANVAS_PAD = WIDGET_GAP / 2

export { DEFAULT_WIDGET_WIDTH, DEFAULT_WIDGET_HEIGHT, WIDGET_GAP, CANVAS_PAD }

const MIN_WIDGET_WIDTH = 280

/** Keep a widget fully inside the canvas width (no horizontal overflow). */
export function clampWidgetToCanvas<
  T extends { x: number; width: number },
>(widget: T, canvasWidth: number): T {
  const maxRight = Math.max(CANVAS_PAD + MIN_WIDGET_WIDTH, canvasWidth - CANVAS_PAD)
  let width = Math.min(Math.max(MIN_WIDGET_WIDTH, widget.width), maxRight - CANVAS_PAD)
  let x = Math.max(CANVAS_PAD, Math.min(widget.x, maxRight - width))
  if (x + width > maxRight) {
    width = Math.max(MIN_WIDGET_WIDTH, maxRight - x)
    x = Math.max(CANVAS_PAD, maxRight - width)
  }
  if (x === widget.x && width === widget.width) return widget
  return { ...widget, x, width }
}

export function clampAllWidgetsToCanvas(
  widgets: PlacedWidget[],
  canvasWidth: number,
): PlacedWidget[] {
  let changed = false
  const next = widgets.map((w) => {
    const clamped = clampWidgetToCanvas(w, canvasWidth)
    if (clamped !== w) changed = true
    return clamped
  })
  return changed ? next : widgets
}

const FLOAT_CASCADE = 32

/** Cascade offset for floating widgets layered over a full workspace. */
function floatingCascadePosition(
  existing: PlacedWidget[],
  availableWidth: number,
  availableHeight: number,
  widgetWidth: number,
  widgetHeight: number,
): { x: number; y: number } {
  const floaters = existing.filter((w) => w.floating)
  const n = floaters.length
  const maxX = Math.max(
    CANVAS_PAD,
    availableWidth - CANVAS_PAD - widgetWidth,
  )
  const maxY = Math.max(
    CANVAS_PAD,
    availableHeight - CANVAS_PAD - widgetHeight,
  )
  return {
    x: Math.min(CANVAS_PAD + FLOAT_CASCADE + n * FLOAT_CASCADE, maxX),
    y: Math.min(CANVAS_PAD + FLOAT_CASCADE + n * FLOAT_CASCADE, maxY),
  }
}

/**
 * Place a new widget to the right of the last tiled one, wrap to the next row,
 * or float over the layout when the visible workspace is full.
 */
export function nextToLastPosition(
  existing: PlacedWidget[],
  availableWidth: number,
  availableHeight = Number.POSITIVE_INFINITY,
  widgetWidth = DEFAULT_WIDGET_WIDTH,
  widgetHeight = DEFAULT_WIDGET_HEIGHT,
): { x: number; y: number; wrapped: boolean; floating: boolean } {
  const tiled = existing.filter((w) => !w.floating)

  if (tiled.length === 0) {
    // Viewport already too short for a default tile → still place at origin
    // (first widget is never floating).
    return { x: CANVAS_PAD, y: CANVAS_PAD, wrapped: false, floating: false }
  }

  const last = tiled[tiled.length - 1]!
  const nextX = last.x + last.width + WIDGET_GAP
  // Usable right edge sits at half-gutter from the canvas boundary
  const maxRight = Math.max(
    availableWidth - CANVAS_PAD,
    CANVAS_PAD + widgetWidth,
  )
  const maxBottom = Math.max(
    availableHeight - CANVAS_PAD,
    CANVAS_PAD + widgetHeight,
  )

  // Room to the right of the last tiled widget
  if (nextX + widgetWidth <= maxRight) {
    // Only tile beside if the last widget itself still sits in-viewport
    if (last.y + widgetHeight <= maxBottom) {
      return { x: nextX, y: last.y, wrapped: false, floating: false }
    }
    const cascade = floatingCascadePosition(
      existing,
      availableWidth,
      availableHeight,
      widgetWidth,
      widgetHeight,
    )
    return { ...cascade, wrapped: false, floating: true }
  }

  const rowMates = tiled.filter((w) => Math.abs(w.y - last.y) <= 24)
  const rowBottom = Math.max(
    ...rowMates.map((w) => w.y + w.height),
    last.y + last.height,
  )
  const nextY = rowBottom + WIDGET_GAP

  // Room for another row within the visible workspace
  if (nextY + widgetHeight <= maxBottom) {
    return { x: CANVAS_PAD, y: nextY, wrapped: true, floating: false }
  }

  const cascade = floatingCascadePosition(
    existing,
    availableWidth,
    availableHeight,
    widgetWidth,
    widgetHeight,
  )
  return { ...cascade, wrapped: false, floating: true }
}

export function createWidgetInstance(
  def: WidgetDefinition,
  layoutIndex = 0,
  position?: { x: number; y: number },
  /** Defaults to None — user-built views start unlinked. */
  linkGroup: WidgetLinkGroup = null,
): PlacedWidget {
  const col = layoutIndex % 2
  const row = Math.floor(layoutIndex / 2)
  const width = DEFAULT_WIDGET_WIDTH
  const height = DEFAULT_WIDGET_HEIGHT
  return {
    ...def,
    instanceId: `${def.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    linkGroup,
    x: position?.x ?? CANVAS_PAD + col * (width + WIDGET_GAP),
    y: position?.y ?? CANVAS_PAD + row * (height + WIDGET_GAP),
    width,
    height,
    config: defaultConfigFor(def.id),
  }
}

export function defaultConfigFor(widgetId: string): Record<string, string> {
  switch (widgetId) {
    case 'chart':
      return {
        timeframe: '1Y',
        style: 'Line',
        compare: 'None',
        security: 'NVDA',
      }
    case 'news':
      return { filter: 'All', sort: 'Latest' }
    case 'news-feed':
      return { sources: 'All', range: 'All Dates', security: 'NVDA' }
    case 'graphic-dashboard':
      return { page: '1', security: 'NVDA' }
    case 'world-equity-indices':
      return { view: 'Standard', currency: 'USD' }
    case 'international-clock':
      return {
        format: '24h',
        cities: 'Chicago,New York,London,Hong Kong,Sydney',
      }
    case 'financial-analysis':
      return { period: 'Quarterly', statement: 'Income', security: 'NVDA' }
    case 'relative-valuation':
      return { security: 'NVDA' }
    case 'description':
      return { security: 'NVDA' }
    case 'watchlist':
      return { sort: 'Change %', density: 'Compact' }
    case 'quote-monitor':
      return { columns: 'Standard', security: 'NVDA' }
    case 'vertical-quote':
      return { security: 'TSLA' }
    default:
      return {}
  }
}

/** Place widgets from ids in reading order, docking neighbors. */
export function widgetsFromIds(
  widgetIds: string[],
  availableWidth = 1400,
  availableHeight = Number.POSITIVE_INFINITY,
  /** User-built canvases start unlinked; seeded/template layouts pass `'lg-a'`. */
  defaultLinkGroup: WidgetLinkGroup = null,
): PlacedWidget[] {
  const defs = widgetIds
    .map((id) => LAUNCHPAD_WIDGETS.find((w) => w.id === id))
    .filter((w): w is WidgetDefinition => Boolean(w))

  const placed: PlacedWidget[] = []
  for (const [index, def] of defs.entries()) {
    const pos = nextToLastPosition(placed, availableWidth, availableHeight)
    const widget = createWidgetInstance(def, index, pos, defaultLinkGroup)
    if (pos.floating) {
      widget.floating = true
    } else {
      const tiled = placed.filter((w) => !w.floating)
      const last = tiled[tiled.length - 1]
      if (last && !pos.wrapped) {
        widget.dock = { targetId: last.instanceId, side: 'right' }
      } else if (last && pos.wrapped) {
        const rowMates = tiled.filter((w) => Math.abs(w.y - last.y) <= 24)
        const anchor = rowMates.reduce((a, b) => (a.x <= b.x ? a : b))
        widget.dock = { targetId: anchor.instanceId, side: 'bottom' }
      }
    }
    placed.push(widget)
  }
  return stretchRowsToFillWidth(placed, availableWidth)
}

/**
 * Expand each row’s widgets so they share the full canvas width
 * (keeps gutters; last row stretches too).
 */
export function stretchRowsToFillWidth(
  widgets: PlacedWidget[],
  availableWidth: number,
): PlacedWidget[] {
  if (widgets.length === 0) return widgets
  const maxRight = Math.max(availableWidth - CANVAS_PAD, CANVAS_PAD + MIN_WIDGET_WIDTH)
  const usable = maxRight - CANVAS_PAD

  const rows = new Map<number, PlacedWidget[]>()
  for (const w of widgets) {
    if (w.floating) continue
    const key = Math.round(w.y / 4) * 4
    const list = rows.get(key) ?? []
    list.push(w)
    rows.set(key, list)
  }

  const byId = new Map(widgets.map((w) => [w.instanceId, { ...w }]))

  for (const row of rows.values()) {
    const sorted = [...row].sort((a, b) => a.x - b.x)
    const gaps = Math.max(0, sorted.length - 1) * WIDGET_GAP
    const targetTotal = usable - gaps
    if (targetTotal <= 0) continue
    const currentTotal = sorted.reduce((n, w) => n + w.width, 0)
    if (currentTotal <= 0) continue

    let x = CANVAS_PAD
    for (const w of sorted) {
      const next = byId.get(w.instanceId)!
      const width = Math.max(
        MIN_WIDGET_WIDTH,
        Math.round((w.width / currentTotal) * targetTotal),
      )
      next.x = x
      next.width = width
      x += width + WIDGET_GAP
      byId.set(w.instanceId, next)
    }

    // Absorb rounding so the last widget hits the right edge
    const last = sorted[sorted.length - 1]!
    const lastNext = byId.get(last.instanceId)!
    const overflow = lastNext.x + lastNext.width - maxRight
    if (overflow !== 0) {
      lastNext.width = Math.max(MIN_WIDGET_WIDTH, lastNext.width - overflow)
      byId.set(last.instanceId, lastNext)
    }
  }

  return widgets.map((w) => byId.get(w.instanceId) ?? w)
}

const MIN_WIDGET_HEIGHT = 160

/**
 * Scale tiled rows so the layout fills the visible canvas height
 * when there is unused vertical space (wide / tall monitors).
 */
export function stretchRowsToFillHeight(
  widgets: PlacedWidget[],
  availableHeight: number,
): PlacedWidget[] {
  if (widgets.length === 0 || availableHeight <= 0) return widgets
  const tiled = widgets.filter((w) => !w.floating)
  if (tiled.length === 0) return widgets

  const top = Math.min(...tiled.map((w) => w.y))
  const bottom = Math.max(...tiled.map((w) => w.y + w.height))
  const currentSpan = bottom - top
  const usable = availableHeight - CANVAS_PAD * 2
  if (currentSpan <= 0 || usable <= currentSpan + 1) return widgets

  const scale = usable / currentSpan
  const byId = new Map(widgets.map((w) => [w.instanceId, { ...w }]))

  for (const w of tiled) {
    const next = byId.get(w.instanceId)!
    const relY = w.y - top
    next.y = CANVAS_PAD + Math.round(relY * scale)
    next.height = Math.max(MIN_WIDGET_HEIGHT, Math.round(w.height * scale))
    byId.set(w.instanceId, next)
  }

  // Absorb rounding on the last row so content hits the bottom pad
  const maxBottom = Math.max(
    ...[...byId.values()]
      .filter((w) => !w.floating)
      .map((w) => w.y + w.height),
  )
  const targetBottom = availableHeight - CANVAS_PAD
  const drift = maxBottom - targetBottom
  if (Math.abs(drift) >= 1) {
    const lastRowY = Math.max(
      ...[...byId.values()].filter((w) => !w.floating).map((w) => w.y),
    )
    for (const w of byId.values()) {
      if (w.floating || Math.abs(w.y - lastRowY) > 4) continue
      w.height = Math.max(MIN_WIDGET_HEIGHT, w.height - drift)
    }
  }

  return widgets.map((w) => byId.get(w.instanceId) ?? w)
}

/** Stretch a seeded / saved layout to fill the current viewport. */
export function fitWidgetsToCanvas(
  widgets: PlacedWidget[],
  availableWidth: number,
  availableHeight?: number,
): PlacedWidget[] {
  let next = stretchRowsToFillWidth(widgets, availableWidth)
  if (availableHeight != null && availableHeight > 0) {
    next = stretchRowsToFillHeight(next, availableHeight)
  }
  return next
}

export function widgetsFromTemplate(
  templateId: string,
  availableWidth = 1400,
  availableHeight = Number.POSITIVE_INFINITY,
): PlacedWidget[] {
  const template = WORKSPACE_TEMPLATES.find((t) => t.id === templateId)
  if (!template) return []
  return widgetsFromIds(
    template.widgetIds,
    availableWidth,
    availableHeight,
    'lg-a',
  )
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createBlankView(name: string): LaunchpadView {
  return {
    id: uniqueId('view'),
    name,
    pages: [
      {
        id: uniqueId('page'),
        name: 'Page 1',
        widgets: [],
        linkGroups: defaultLinkGroups(),
      },
    ],
  }
}

export function createViewFromTemplate(
  name: string,
  templateId: string,
): LaunchpadView {
  return {
    id: uniqueId('view'),
    name,
    pages: [
      {
        id: uniqueId('page'),
        name: 'Page 1',
        widgets: widgetsFromTemplate(templateId),
        linkGroups: defaultLinkGroups(),
      },
    ],
  }
}

export type LaunchpadScenario = 'first-time' | 'returning'

/** Stable keys for the three demo saved views (scenario 2). */
export const RETURNING_DEMO_VIEWS = [
  { key: 'us-equities', name: 'US Equities' },
  { key: 'daily-start', name: 'Daily Start' },
  { key: 'commodity', name: 'Commodity' },
] as const

export type ReturningDemoViewKey = (typeof RETURNING_DEMO_VIEWS)[number]['key']

/** Typical Launchpad canvas width used when seeding dense demo layouts. */
const SEED_CANVAS_WIDTH = 1400

function seededPage(name: string, widgetIds: string[]): LaunchpadPage {
  return {
    id: uniqueId('page'),
    name,
    widgets: widgetsFromIds(widgetIds, SEED_CANVAS_WIDTH, undefined, 'lg-a'),
    linkGroups: defaultLinkGroups(),
  }
}

/** Seeded workspace for the “views already exist” demo scenario. */
export function createReturningUserViews(): LaunchpadView[] {
  const usEquities: LaunchpadView = {
    id: 'view-us-equities',
    name: 'US Equities',
    pages: [
      seededPage('Overview', [
        'watchlist',
        'vertical-quote',
        'description',
        'chart',
        'financial-analysis',
        'relative-valuation',
        'news-feed',
        'graphic-dashboard',
        'quote-monitor',
      ]),
      seededPage('Deep dive', [
        'chart',
        'financial-analysis',
        'relative-valuation',
        'news',
        'description',
        'graphic-dashboard',
        'world-equity-indices',
        'watchlist',
        'vertical-quote',
      ]),
    ],
  }

  const dailyStart: LaunchpadView = {
    id: 'view-daily-start',
    name: 'Daily Start',
    pages: [
      seededPage('Morning', [
        'international-clock',
        'world-equity-indices',
        'watchlist',
        'news-feed',
        'quote-monitor',
        'chart',
        'graphic-dashboard',
        'vertical-quote',
        'news',
      ]),
    ],
  }

  const commodity: LaunchpadView = {
    id: 'view-commodity',
    name: 'Commodity',
    pages: [
      seededPage('Markets', [
        'watchlist',
        'chart',
        'relative-valuation',
        'financial-analysis',
        'news-feed',
        'graphic-dashboard',
        'description',
        'quote-monitor',
        'world-equity-indices',
      ]),
    ],
  }

  return [usEquities, dailyStart, commodity]
}

export function returningViewIdForKey(key: ReturningDemoViewKey): string {
  return `view-${key}`
}
