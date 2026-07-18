import type { PlacedWidget } from '../data/launchpadModel'

export const SNAP_THRESHOLD = 16
/** Apply a hard size snap only when this close — guides can show earlier. */
export const SNAP_APPLY_THRESHOLD = 6
export const SNAP_GAP = 8
const MIN_W = 280
const MIN_H = 160
const MAX_W = 2400
const MAX_H = 2400
const GUTTER_HALF = SNAP_GAP / 2

export type DockSide = 'left' | 'right' | 'top' | 'bottom'

/** Persistent stick: this widget attaches to a side of `targetId`. */
export type WidgetDock = {
  targetId: string
  side: DockSide
}

/** Figma-style alignment guide line. */
export type AlignGuide = {
  orientation: 'horizontal' | 'vertical'
  /** Edge align sits on a widget edge; gutter sits in the midpoint of the gap. */
  kind: 'edge' | 'gutter'
  x1: number
  y1: number
  x2: number
  y2: number
}

export type SnapGuide = {
  x: number
  y: number
  width: number
  height: number
  /** One dock (side or stack) or two (corner: side + upper/lower). */
  docks: Array<{ targetId: string; side: DockSide }>
  guides: AlignGuide[]
}

type Rect = Pick<PlacedWidget, 'instanceId' | 'x' | 'y' | 'width' | 'height'>

function overlapAmount(a1: number, a2: number, b1: number, b2: number) {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1))
}

/** Minimum shared band (px) to count as adjacent — blocks diagonal snaps. */
const MIN_ADJACENT_OVERLAP = 48

/** Side-by-side eligible: share a vertical band (left/right dock). */
function isSideAdjacent(a: Rect, b: Rect) {
  const yOverlap = overlapAmount(
    a.y,
    a.y + a.height,
    b.y,
    b.y + b.height,
  )
  return yOverlap >= Math.min(MIN_ADJACENT_OVERLAP, Math.min(a.height, b.height) * 0.35)
}

/** Stacked eligible: share a horizontal band (top/bottom dock). */
function isStackAdjacent(a: Rect, b: Rect) {
  const xOverlap = overlapAmount(
    a.x,
    a.x + a.width,
    b.x,
    b.x + b.width,
  )
  return xOverlap >= Math.min(MIN_ADJACENT_OVERLAP, Math.min(a.width, b.width) * 0.35)
}

function alignY(moving: Rect, other: Rect) {
  if (Math.abs(moving.y - other.y) <= SNAP_THRESHOLD) return other.y
  if (
    Math.abs(moving.y + moving.height - (other.y + other.height)) <=
    SNAP_THRESHOLD
  ) {
    return other.y + other.height - moving.height
  }
  return moving.y
}

function alignX(moving: Rect, other: Rect) {
  if (Math.abs(moving.x - other.x) <= SNAP_THRESHOLD) return other.x
  if (
    Math.abs(moving.x + moving.width - (other.x + other.width)) <=
    SNAP_THRESHOLD
  ) {
    return other.x + other.width - moving.width
  }
  return moving.x
}

/** Vertical guide through the midpoint of a horizontal gutter — shared band only. */
function verticalGutterGuide(
  gutterX: number,
  target: Rect,
  moving: Rect,
): AlignGuide | null {
  const overlapTop = Math.max(target.y, moving.y)
  const overlapBottom = Math.min(
    target.y + target.height,
    moving.y + moving.height,
  )
  // No shared vertical band → not side-adjacent (e.g. diagonal). No guide.
  if (overlapBottom - overlapTop < 8) return null
  return {
    orientation: 'vertical',
    kind: 'gutter',
    x1: gutterX,
    y1: overlapTop - 2,
    x2: gutterX,
    y2: overlapBottom + 2,
  }
}

/** Horizontal guide through the midpoint of a vertical gutter — shared band only. */
function horizontalGutterGuide(
  gutterY: number,
  target: Rect,
  moving: Rect,
): AlignGuide | null {
  const overlapLeft = Math.max(target.x, moving.x)
  const overlapRight = Math.min(
    target.x + target.width,
    moving.x + moving.width,
  )
  // No shared horizontal band → not stack-adjacent (e.g. diagonal). No guide.
  if (overlapRight - overlapLeft < 8) return null
  return {
    orientation: 'horizontal',
    kind: 'gutter',
    x1: overlapLeft - 2,
    y1: gutterY,
    x2: overlapRight + 2,
    y2: gutterY,
  }
}

/**
 * Blue (alignment) + red (snap) pair, both drawn in the gutter —
 * never on the widget edge. Limited to the adjacent overlap band.
 */
function gapCenterGuidePair(
  orientation: 'horizontal' | 'vertical',
  gutterCenter: number,
  a: Rect,
  b: Rect,
): AlignGuide[] {
  const blueAt = gutterCenter - 1
  const redAt = gutterCenter + 1
  if (orientation === 'vertical') {
    const blue = verticalGutterGuide(blueAt, a, b)
    const red = verticalGutterGuide(redAt, a, b)
    return [
      ...(blue ? [{ ...blue, kind: 'edge' as const }] : []),
      ...(red ? [red] : []),
    ]
  }
  const blue = horizontalGutterGuide(blueAt, a, b)
  const red = horizontalGutterGuide(redAt, a, b)
  return [
    ...(blue ? [{ ...blue, kind: 'edge' as const }] : []),
    ...(red ? [red] : []),
  ]
}

/** Midpoint of the gap between two non-overlapping rects, if any. */
function liveGapCenter(
  a: Rect,
  b: Rect,
): { orientation: 'horizontal' | 'vertical'; center: number } | null {
  if (a.x + a.width <= b.x) {
    return {
      orientation: 'vertical',
      center: (a.x + a.width + b.x) / 2,
    }
  }
  if (b.x + b.width <= a.x) {
    return {
      orientation: 'vertical',
      center: (b.x + b.width + a.x) / 2,
    }
  }
  if (a.y + a.height <= b.y) {
    return {
      orientation: 'horizontal',
      center: (a.y + a.height + b.y) / 2,
    }
  }
  if (b.y + b.height <= a.y) {
    return {
      orientation: 'horizontal',
      center: (b.y + b.height + a.y) / 2,
    }
  }
  return null
}

type AxisCandidate = {
  dist: number
  x: number
  y: number
  targetId: string
  side: DockSide
  guides: AlignGuide[]
}

/**
 * When a dragged widget is close enough to another, return the snap position.
 * Side and stack snaps are resolved independently so a widget can lock to
 * both an upper edge and a side (corner) at once.
 */
export function findWidgetSnap(
  moving: Rect,
  others: Rect[],
): SnapGuide | null {
  let bestSide: AxisCandidate | null = null
  let bestStack: AxisCandidate | null = null

  const considerSide = (c: AxisCandidate) => {
    if (c.dist > SNAP_THRESHOLD) return
    if (!bestSide || c.dist < bestSide.dist) bestSide = c
  }
  const considerStack = (c: AxisCandidate) => {
    if (c.dist > SNAP_THRESHOLD) return
    if (!bestStack || c.dist < bestStack.dist) bestStack = c
  }

  for (const other of others) {
    if (other.instanceId === moving.instanceId) continue

    // Side snaps only against horizontally neighboring widgets (shared Y band).
    // Stack snaps only against vertically neighboring widgets (shared X band).
    // Diagonally opposite widgets never participate — a corner lock is the
    // combination of bestSide from widget A + bestStack from widget B.
    const sideOk = isSideAdjacent(moving, other)
    const stackOk = isStackAdjacent(moving, other)

    if (sideOk) {
      const y = alignY(moving, other)
      const placedRight = {
        ...moving,
        x: Math.max(0, other.x + other.width + SNAP_GAP),
        y: Math.max(0, y),
      }
      const gutterCenterRight = other.x + other.width + GUTTER_HALF
      considerSide({
        dist: Math.abs(
          (other.x + other.width + moving.x) / 2 - gutterCenterRight,
        ),
        x: placedRight.x,
        y: placedRight.y,
        targetId: other.instanceId,
        side: 'right',
        guides: gapCenterGuidePair(
          'vertical',
          gutterCenterRight,
          other,
          placedRight,
        ),
      })

      const placedLeft = {
        ...moving,
        x: Math.max(0, other.x - moving.width - SNAP_GAP),
        y: Math.max(0, y),
      }
      const gutterCenterLeft = other.x - GUTTER_HALF
      considerSide({
        dist: Math.abs((moving.x + moving.width + other.x) / 2 - gutterCenterLeft),
        x: placedLeft.x,
        y: placedLeft.y,
        targetId: other.instanceId,
        side: 'left',
        guides: gapCenterGuidePair(
          'vertical',
          gutterCenterLeft,
          other,
          placedLeft,
        ),
      })
    }

    if (stackOk) {
      const x = alignX(moving, other)
      const placedBelow = {
        ...moving,
        x: Math.max(0, x),
        y: Math.max(0, other.y + other.height + SNAP_GAP),
      }
      const gutterCenterBelow = other.y + other.height + GUTTER_HALF
      considerStack({
        dist: Math.abs(
          (other.y + other.height + moving.y) / 2 - gutterCenterBelow,
        ),
        x: placedBelow.x,
        y: placedBelow.y,
        targetId: other.instanceId,
        side: 'bottom',
        guides: gapCenterGuidePair(
          'horizontal',
          gutterCenterBelow,
          other,
          placedBelow,
        ),
      })

      const placedAbove = {
        ...moving,
        x: Math.max(0, x),
        y: Math.max(0, other.y - moving.height - SNAP_GAP),
      }
      const gutterCenterAbove = other.y - GUTTER_HALF
      considerStack({
        dist: Math.abs(
          (moving.y + moving.height + other.y) / 2 - gutterCenterAbove,
        ),
        x: placedAbove.x,
        y: placedAbove.y,
        targetId: other.instanceId,
        side: 'top',
        guides: gapCenterGuidePair(
          'horizontal',
          gutterCenterAbove,
          other,
          placedAbove,
        ),
      })
    }
  }

  if (!bestSide && !bestStack) return null

  // Combine axes: side owns X, stack owns Y (corner = both)
  const x = bestSide?.x ?? bestStack?.x ?? moving.x
  const y = bestStack?.y ?? bestSide?.y ?? moving.y
  const docks = [
    ...(bestSide
      ? [{ targetId: bestSide.targetId, side: bestSide.side }]
      : []),
    ...(bestStack
      ? [{ targetId: bestStack.targetId, side: bestStack.side }]
      : []),
  ]

  // Rebuild guides from the final combined rect so spans stay on adjacent targets
  const finalRect = { ...moving, x, y }
  const guides: AlignGuide[] = []
  if (bestSide) {
    const target = others.find((o) => o.instanceId === bestSide.targetId)
    if (target) {
      const gutterCenter =
        bestSide.side === 'right'
          ? target.x + target.width + GUTTER_HALF
          : target.x - GUTTER_HALF
      guides.push(
        ...gapCenterGuidePair('vertical', gutterCenter, target, finalRect),
      )
    }
  }
  if (bestStack) {
    const target = others.find((o) => o.instanceId === bestStack.targetId)
    if (target) {
      const gutterCenter =
        bestStack.side === 'bottom'
          ? target.y + target.height + GUTTER_HALF
          : target.y - GUTTER_HALF
      guides.push(
        ...gapCenterGuidePair('horizontal', gutterCenter, target, finalRect),
      )
    }
  }

  return {
    x,
    y,
    width: moving.width,
    height: moving.height,
    docks,
    guides,
  }
}

/** Keep a docked child flush to its parent; absorb parent size change on the shared axis. */
function stickAndFill(
  child: PlacedWidget,
  parentBefore: PlacedWidget,
  parentAfter: PlacedWidget,
): PlacedWidget {
  const side = child.dock?.side
  if (!side) return child

  const dy = parentAfter.y - parentBefore.y
  const dx = parentAfter.x - parentBefore.x

  if (side === 'right') {
    const newX = parentAfter.x + parentAfter.width + SNAP_GAP
    const widthDelta = parentAfter.width - parentBefore.width
    return {
      ...child,
      x: Math.max(0, newX),
      y: Math.max(0, child.y + dy),
      width: Math.max(MIN_W, child.width - widthDelta),
    }
  }

  if (side === 'left') {
    return {
      ...child,
      x: Math.max(0, parentAfter.x - child.width - SNAP_GAP),
      y: Math.max(0, child.y + dy),
    }
  }

  if (side === 'bottom') {
    const newY = parentAfter.y + parentAfter.height + SNAP_GAP
    const heightDelta = parentAfter.height - parentBefore.height
    return {
      ...child,
      x: Math.max(0, child.x + dx),
      y: Math.max(0, newY),
      height: Math.max(MIN_H, child.height - heightDelta),
    }
  }

  return {
    ...child,
    x: Math.max(0, child.x + dx),
    y: Math.max(0, parentAfter.y - child.height - SNAP_GAP),
  }
}

function reassertDock(
  child: PlacedWidget,
  parent: PlacedWidget,
): PlacedWidget {
  const side = child.dock?.side
  if (!side) return child
  if (side === 'right') {
    return { ...child, x: Math.max(0, parent.x + parent.width + SNAP_GAP) }
  }
  if (side === 'left') {
    return {
      ...child,
      x: Math.max(0, parent.x - child.width - SNAP_GAP),
    }
  }
  if (side === 'bottom') {
    return { ...child, y: Math.max(0, parent.y + parent.height + SNAP_GAP) }
  }
  return {
    ...child,
    y: Math.max(0, parent.y - child.height - SNAP_GAP),
  }
}

/**
 * Apply a layout change and reflow every widget docked (transitively) to it.
 */
export function applyLayoutWithDocks(
  widgets: PlacedWidget[],
  instanceId: string,
  layout: { x?: number; y?: number; width?: number; height?: number },
): PlacedWidget[] {
  const prev = widgets.find((w) => w.instanceId === instanceId)
  if (!prev) return widgets

  let list = widgets.map((w) =>
    w.instanceId === instanceId ? { ...w, ...layout } : w,
  )
  let after = list.find((w) => w.instanceId === instanceId)!

  if (after.dock) {
    const parent = list.find((w) => w.instanceId === after.dock!.targetId)
    if (parent) {
      after = reassertDock(after, parent)
      list = list.map((w) => (w.instanceId === instanceId ? after : w))
    }
  }

  const reflow = (
    changedId: string,
    before: PlacedWidget,
    next: PlacedWidget,
  ) => {
    for (const child of list) {
      if (child.dock?.targetId !== changedId) continue
      const updated = stickAndFill(child, before, next)
      list = list.map((w) => (w.instanceId === child.instanceId ? updated : w))
      reflow(child.instanceId, child, updated)
    }
  }

  reflow(instanceId, prev, after)
  return list
}

/** True if `other` sits on the given side of `self` across a snap gutter. */
function isSnappedOnSide(
  self: Rect,
  other: Rect,
  side: 'right' | 'bottom' | 'left' | 'top',
): boolean {
  if (side === 'right') {
    const gap = other.x - (self.x + self.width)
    if (gap < 2 || gap > SNAP_GAP + 8) return false
    return isSideAdjacent(self, other)
  }
  if (side === 'left') {
    const gap = self.x - (other.x + other.width)
    if (gap < 2 || gap > SNAP_GAP + 8) return false
    return isSideAdjacent(self, other)
  }
  if (side === 'bottom') {
    const gap = other.y - (self.y + self.height)
    if (gap < 2 || gap > SNAP_GAP + 8) return false
    return isStackAdjacent(self, other)
  }
  const gap = self.y - (other.y + other.height)
  if (gap < 2 || gap > SNAP_GAP + 8) return false
  return isStackAdjacent(self, other)
}

/**
 * Resize a widget from any edge/corner and push/pull snapped neighbors on
 * every edge that moves (left/right/top/bottom).
 */
export function resizeAffectingSnappedNeighbors(
  widgets: PlacedWidget[],
  instanceId: string,
  layout: { x?: number; y?: number; width?: number; height?: number },
): PlacedWidget[] {
  const prev = widgets.find((w) => w.instanceId === instanceId)
  if (!prev) return widgets

  const nextSelf: PlacedWidget = { ...prev, ...layout }
  const leftMoved = nextSelf.x !== prev.x
  const topMoved = nextSelf.y !== prev.y
  const rightMoved =
    nextSelf.x + nextSelf.width !== prev.x + prev.width
  const bottomMoved =
    nextSelf.y + nextSelf.height !== prev.y + prev.height
  const widthDelta = nextSelf.width - prev.width
  const heightDelta = nextSelf.height - prev.height

  return widgets.map((w) => {
    if (w.instanceId === instanceId) return nextSelf

    const dockedToMyRight =
      w.dock?.targetId === instanceId && w.dock.side === 'right'
    const iAmLeftOfThem =
      prev.dock?.targetId === w.instanceId && prev.dock.side === 'left'
    const onRight =
      dockedToMyRight ||
      iAmLeftOfThem ||
      isSnappedOnSide(prev, w, 'right')

    const dockedToMyLeft =
      w.dock?.targetId === instanceId && w.dock.side === 'left'
    const iAmRightOfThem =
      prev.dock?.targetId === w.instanceId && prev.dock.side === 'right'
    const onLeft =
      dockedToMyLeft ||
      iAmRightOfThem ||
      isSnappedOnSide(prev, w, 'left')

    const dockedToMyBottom =
      w.dock?.targetId === instanceId && w.dock.side === 'bottom'
    const iAmAboveThem =
      prev.dock?.targetId === w.instanceId && prev.dock.side === 'top'
    const onBottom =
      dockedToMyBottom ||
      iAmAboveThem ||
      isSnappedOnSide(prev, w, 'bottom')

    const dockedToMyTop =
      w.dock?.targetId === instanceId && w.dock.side === 'top'
    const iAmBelowThem =
      prev.dock?.targetId === w.instanceId && prev.dock.side === 'bottom'
    const onTop =
      dockedToMyTop ||
      iAmBelowThem ||
      isSnappedOnSide(prev, w, 'top')

    let next = { ...w }

    // Right edge moved → neighbor on the right absorbs width delta
    if (onRight && rightMoved && widthDelta !== 0) {
      next = {
        ...next,
        x: nextSelf.x + nextSelf.width + SNAP_GAP,
        width: Math.max(MIN_W, w.width - widthDelta),
        dock: next.dock ?? { targetId: instanceId, side: 'right' as const },
      }
    }

    // Left edge moved → neighbor on the left keeps its left; right edge tracks ours
    if (onLeft && leftMoved) {
      const newRight = nextSelf.x - SNAP_GAP
      const newWidth = Math.max(MIN_W, newRight - w.x)
      next = {
        ...next,
        width: newWidth,
        dock: next.dock ?? { targetId: instanceId, side: 'left' as const },
      }
    }

    // Bottom edge moved → neighbor below absorbs height delta
    if (onBottom && bottomMoved && heightDelta !== 0) {
      next = {
        ...next,
        y: nextSelf.y + nextSelf.height + SNAP_GAP,
        height: Math.max(MIN_H, w.height - heightDelta),
        dock:
          next.dock ?? { targetId: instanceId, side: 'bottom' as const },
      }
    }

    // Top edge moved → neighbor above keeps its top; bottom edge tracks ours
    if (onTop && topMoved) {
      const newBottom = nextSelf.y - SNAP_GAP
      const newHeight = Math.max(MIN_H, newBottom - w.y)
      next = {
        ...next,
        height: newHeight,
        dock: next.dock ?? { targetId: instanceId, side: 'top' as const },
      }
    }

    return next
  })
}

export function clearDock(
  widgets: PlacedWidget[],
  instanceId: string,
): PlacedWidget[] {
  return widgets.map((w) =>
    w.instanceId === instanceId ? { ...w, dock: undefined } : w,
  )
}

/** Break every dock that involves this widget (as child or as target). */
export function breakDocksInvolving(
  widgets: PlacedWidget[],
  instanceId: string,
): PlacedWidget[] {
  return widgets.map((w) => {
    if (w.instanceId === instanceId) return { ...w, dock: undefined }
    if (w.dock?.targetId === instanceId) return { ...w, dock: undefined }
    return w
  })
}

/**
 * Widgets that share the same height and top edge — resize height together.
 */
export function heightAlignedPeers(
  widgets: PlacedWidget[],
  source: PlacedWidget,
): PlacedWidget[] {
  return widgets.filter(
    (w) =>
      w.instanceId !== source.instanceId &&
      Math.abs(w.height - source.height) <= 2 &&
      Math.abs(w.y - source.y) <= 2,
  )
}

/**
 * Widgets that share the same width and left edge — resize width together.
 */
export function widthAlignedPeers(
  widgets: PlacedWidget[],
  source: PlacedWidget,
): PlacedWidget[] {
  return widgets.filter(
    (w) =>
      w.instanceId !== source.instanceId &&
      Math.abs(w.width - source.width) <= 2 &&
      Math.abs(w.x - source.x) <= 2,
  )
}

export type CollectiveGutterHandle = {
  id: string
  /**
   * width  = vertical gutter → drag horizontally (column split)
   * height = horizontal gutter → drag vertically (row split)
   */
  axis: 'height' | 'width'
  x: number
  y: number
  width: number
  height: number
  /** Widgets on the leading side of the gutter (left / above). */
  primaryIds: string[]
  /** Widgets on the trailing side of the gutter (right / below). */
  secondaryIds: string[]
}

type GutterSegment = {
  gutterX?: number
  gutterY?: number
  gap: number
  primary: PlacedWidget
  secondary: PlacedWidget
}

/**
 * Gutter handles between aligned widgets. Co-linear gutters merge into one
 * handle that spans the full shared split (e.g. a 2×2 column divider).
 */
export function buildCollectiveGutterHandles(
  widgets: PlacedWidget[],
): CollectiveGutterHandle[] {
  const handles: CollectiveGutterHandle[] = []
  // Floating overlays aren't part of the tiled split layout
  const tiled = widgets.filter((w) => !w.floating)

  // --- Vertical gutters (side-by-side) → width split ---
  const verticalSegs: GutterSegment[] = []
  const byY = [...tiled].sort((a, b) => a.y - b.y || a.x - b.x)
  for (const left of byY) {
    for (const right of byY) {
      if (left.instanceId === right.instanceId) continue
      if (right.x <= left.x) continue
      const gap = right.x - (left.x + left.width)
      if (gap < 4 || gap > SNAP_GAP + 12) continue
      // Must share a vertical band (same row-ish)
      const overlap =
        Math.min(left.y + left.height, right.y + right.height) -
        Math.max(left.y, right.y)
      if (overlap < 24) continue
      verticalSegs.push({
        gutterX: left.x + left.width,
        gap,
        primary: left,
        secondary: right,
      })
    }
  }

  // Cluster by gutter X
  const vClusters = new Map<number, GutterSegment[]>()
  for (const seg of verticalSegs) {
    const key = Math.round((seg.gutterX ?? 0) / 4) * 4
    const list = vClusters.get(key) ?? []
    list.push(seg)
    vClusters.set(key, list)
  }
  for (const [, segs] of vClusters) {
    const primaryIds = [...new Set(segs.map((s) => s.primary.instanceId))]
    const secondaryIds = [...new Set(segs.map((s) => s.secondary.instanceId))]
    const involved = [
      ...segs.map((s) => s.primary),
      ...segs.map((s) => s.secondary),
    ]
    const top = Math.min(...involved.map((w) => w.y))
    const bottom = Math.max(...involved.map((w) => w.y + w.height))
    const gap = Math.round(
      segs.reduce((sum, s) => sum + s.gap, 0) / segs.length,
    )
    const gutterX = Math.round(
      segs.reduce((sum, s) => sum + (s.gutterX ?? 0), 0) / segs.length,
    )
    handles.push({
      id: `ch-w-${[...primaryIds].sort().join('_')}__${[...secondaryIds].sort().join('_')}`,
      axis: 'width',
      x: gutterX,
      y: top,
      width: gap,
      height: bottom - top,
      primaryIds,
      secondaryIds,
    })
  }

  // --- Horizontal gutters (stacked) → height split ---
  const horizontalSegs: GutterSegment[] = []
  for (const topW of tiled) {
    for (const bottomW of tiled) {
      if (topW.instanceId === bottomW.instanceId) continue
      if (bottomW.y <= topW.y) continue
      const gap = bottomW.y - (topW.y + topW.height)
      if (gap < 4 || gap > SNAP_GAP + 12) continue
      const overlap =
        Math.min(topW.x + topW.width, bottomW.x + bottomW.width) -
        Math.max(topW.x, bottomW.x)
      if (overlap < 24) continue
      horizontalSegs.push({
        gutterY: topW.y + topW.height,
        gap,
        primary: topW,
        secondary: bottomW,
      })
    }
  }

  const hClusters = new Map<number, GutterSegment[]>()
  for (const seg of horizontalSegs) {
    const key = Math.round((seg.gutterY ?? 0) / 4) * 4
    const list = hClusters.get(key) ?? []
    list.push(seg)
    hClusters.set(key, list)
  }
  for (const [, segs] of hClusters) {
    const primaryIds = [...new Set(segs.map((s) => s.primary.instanceId))]
    const secondaryIds = [...new Set(segs.map((s) => s.secondary.instanceId))]
    const involved = [
      ...segs.map((s) => s.primary),
      ...segs.map((s) => s.secondary),
    ]
    const left = Math.min(...involved.map((w) => w.x))
    const right = Math.max(...involved.map((w) => w.x + w.width))
    const gap = Math.round(
      segs.reduce((sum, s) => sum + s.gap, 0) / segs.length,
    )
    const gutterY = Math.round(
      segs.reduce((sum, s) => sum + (s.gutterY ?? 0), 0) / segs.length,
    )
    handles.push({
      id: `ch-h-${[...primaryIds].sort().join('_')}__${[...secondaryIds].sort().join('_')}`,
      axis: 'height',
      x: left,
      y: gutterY,
      width: right - left,
      height: gap,
      primaryIds,
      secondaryIds,
    })
  }

  return handles
}

/**
 * Apply a splitter delta along a collective gutter.
 * Width: left column grows, right column shrinks (and shifts).
 * Height: top row grows, bottom row shrinks (and shifts).
 */
export function resizeCollectiveGroup(
  widgets: PlacedWidget[],
  handle: CollectiveGutterHandle,
  delta: number,
  origins: Record<
    string,
    { x: number; y: number; width: number; height: number }
  >,
): PlacedWidget[] {
  const primary = new Set(handle.primaryIds)
  const secondary = new Set(handle.secondaryIds)

  // Clamp delta so every side stays within min/max size
  let maxDelta = Infinity
  let minDelta = -Infinity
  for (const id of handle.primaryIds) {
    const o = origins[id]
    if (!o) continue
    if (handle.axis === 'width') {
      maxDelta = Math.min(maxDelta, MAX_W - o.width)
      minDelta = Math.max(minDelta, MIN_W - o.width)
    } else {
      maxDelta = Math.min(maxDelta, MAX_H - o.height)
      minDelta = Math.max(minDelta, MIN_H - o.height)
    }
  }
  for (const id of handle.secondaryIds) {
    const o = origins[id]
    if (!o) continue
    if (handle.axis === 'width') {
      maxDelta = Math.min(maxDelta, o.width - MIN_W)
      minDelta = Math.max(minDelta, o.width - MAX_W)
    } else {
      maxDelta = Math.min(maxDelta, o.height - MIN_H)
      minDelta = Math.max(minDelta, o.height - MAX_H)
    }
  }
  const d = Math.max(minDelta, Math.min(maxDelta, delta))

  return widgets.map((w) => {
    const origin = origins[w.instanceId]
    if (!origin) return w

    if (handle.axis === 'width') {
      if (primary.has(w.instanceId)) {
        return { ...w, width: origin.width + d, dock: undefined }
      }
      if (secondary.has(w.instanceId)) {
        return {
          ...w,
          x: origin.x + d,
          width: origin.width - d,
          dock: undefined,
        }
      }
      return w
    }

    if (primary.has(w.instanceId)) {
      return { ...w, height: origin.height + d, dock: undefined }
    }
    if (secondary.has(w.instanceId)) {
      return {
        ...w,
        y: origin.y + d,
        height: origin.height - d,
        dock: undefined,
      }
    }
    return w
  })
}

export function commitDock(
  widgets: PlacedWidget[],
  instanceId: string,
  snap: SnapGuide,
): PlacedWidget[] {
  const primary =
    snap.docks.find((d) => d.side === 'left' || d.side === 'right') ??
    snap.docks[0]

  return widgets.map((w) => {
    if (w.instanceId === instanceId) {
      return {
        ...w,
        x: snap.x,
        y: snap.y,
        floating: undefined,
        dock: primary
          ? { targetId: primary.targetId, side: primary.side }
          : undefined,
      }
    }
    if (w.dock?.targetId === instanceId) {
      return { ...w, dock: undefined }
    }
    return w
  })
}

/** How close the dragged center must be to a gutter to offer insert. */
const INSERT_HIT = 56

export type InsertTarget = {
  /** width = insert into a vertical gutter (between left/right). */
  axis: 'width' | 'height'
  primaryId: string
  secondaryId: string
  primary: { x: number; y: number; width: number; height: number }
  inserted: { x: number; y: number; width: number; height: number }
  secondary: { x: number; y: number; width: number; height: number }
  guides: AlignGuide[]
  dist: number
}

function splitAlongSpan(
  primarySize: number,
  secondarySize: number,
  span: number,
  desiredInsert: number,
): { primary: number; insert: number; secondary: number } | null {
  const gaps = 2 * SNAP_GAP
  const maxInsert = span - gaps - 2 * MIN_W
  if (maxInsert < MIN_W) return null

  let insert = Math.min(Math.max(desiredInsert, MIN_W), maxInsert)
  let remaining = span - gaps - insert
  const total = primarySize + secondarySize
  let primary = Math.max(
    MIN_W,
    Math.round(remaining * (primarySize / Math.max(total, 1))),
  )
  let secondary = remaining - primary
  if (secondary < MIN_W) {
    secondary = MIN_W
    primary = remaining - secondary
  }
  if (primary < MIN_W) {
    primary = MIN_W
    secondary = remaining - primary
  }
  if (primary < MIN_W || secondary < MIN_W) return null
  return { primary, insert, secondary }
}

/**
 * Detect dropping a widget into the gutter between two tiled neighbors.
 * Used to insert floating (or any) widgets into the existing layout.
 */
export function findInsertTarget(
  moving: Rect,
  others: PlacedWidget[],
): InsertTarget | null {
  const tiled = others.filter(
    (w) => !w.floating && w.instanceId !== moving.instanceId,
  )
  let best: InsertTarget | null = null

  const consider = (candidate: InsertTarget) => {
    if (!best || candidate.dist < best.dist) best = candidate
  }

  const cx = moving.x + moving.width / 2
  const cy = moving.y + moving.height / 2

  for (const left of tiled) {
    for (const right of tiled) {
      if (left.instanceId === right.instanceId) continue
      if (right.x <= left.x) continue
      const gap = right.x - (left.x + left.width)
      if (gap < 2 || gap > SNAP_GAP + 24) continue
      if (!isSideAdjacent(left, right)) continue

      const gutterCenter = left.x + left.width + gap / 2
      const dist = Math.abs(cx - gutterCenter)
      if (dist > INSERT_HIT) continue

      const bandTop = Math.max(left.y, right.y)
      const bandBottom = Math.min(left.y + left.height, right.y + right.height)
      if (cy < bandTop - 8 || cy > bandBottom + 8) continue

      const span = right.x + right.width - left.x
      const sizes = splitAlongSpan(left.width, right.width, span, moving.width)
      if (!sizes) continue

      const insertH = bandBottom - bandTop
      const inserted = {
        x: left.x + sizes.primary + SNAP_GAP,
        y: bandTop,
        width: sizes.insert,
        height: Math.max(MIN_H, insertH),
      }
      const primaryLayout = {
        x: left.x,
        y: left.y,
        width: sizes.primary,
        height: left.height,
      }
      const secondaryLayout = {
        x: inserted.x + inserted.width + SNAP_GAP,
        y: right.y,
        width: sizes.secondary,
        height: right.height,
      }

      consider({
        axis: 'width',
        primaryId: left.instanceId,
        secondaryId: right.instanceId,
        primary: primaryLayout,
        inserted,
        secondary: secondaryLayout,
        dist,
        guides: [
          {
            orientation: 'vertical',
            kind: 'gutter',
            x1: gutterCenter,
            y1: bandTop - 4,
            x2: gutterCenter,
            y2: bandBottom + 4,
          },
          {
            orientation: 'vertical',
            kind: 'edge',
            x1: inserted.x,
            y1: inserted.y,
            x2: inserted.x,
            y2: inserted.y + inserted.height,
          },
          {
            orientation: 'vertical',
            kind: 'edge',
            x1: inserted.x + inserted.width,
            y1: inserted.y,
            x2: inserted.x + inserted.width,
            y2: inserted.y + inserted.height,
          },
        ],
      })
    }
  }

  for (const top of tiled) {
    for (const bottom of tiled) {
      if (top.instanceId === bottom.instanceId) continue
      if (bottom.y <= top.y) continue
      const gap = bottom.y - (top.y + top.height)
      if (gap < 2 || gap > SNAP_GAP + 24) continue
      if (!isStackAdjacent(top, bottom)) continue

      const gutterCenter = top.y + top.height + gap / 2
      const dist = Math.abs(cy - gutterCenter)
      if (dist > INSERT_HIT) continue

      const bandLeft = Math.max(top.x, bottom.x)
      const bandRight = Math.min(top.x + top.width, bottom.x + bottom.width)
      if (cx < bandLeft - 8 || cx > bandRight + 8) continue

      const span = bottom.y + bottom.height - top.y
      const sizes = splitAlongSpan(top.height, bottom.height, span, moving.height)
      if (!sizes) continue

      const insertW = bandRight - bandLeft
      const inserted = {
        x: bandLeft,
        y: top.y + sizes.primary + SNAP_GAP,
        width: Math.max(MIN_W, insertW),
        height: sizes.insert,
      }
      const primaryLayout = {
        x: top.x,
        y: top.y,
        width: top.width,
        height: sizes.primary,
      }
      const secondaryLayout = {
        x: bottom.x,
        y: inserted.y + inserted.height + SNAP_GAP,
        width: bottom.width,
        height: sizes.secondary,
      }

      consider({
        axis: 'height',
        primaryId: top.instanceId,
        secondaryId: bottom.instanceId,
        primary: primaryLayout,
        inserted,
        secondary: secondaryLayout,
        dist,
        guides: [
          {
            orientation: 'horizontal',
            kind: 'gutter',
            x1: bandLeft - 4,
            y1: gutterCenter,
            x2: bandRight + 4,
            y2: gutterCenter,
          },
          {
            orientation: 'horizontal',
            kind: 'edge',
            x1: inserted.x,
            y1: inserted.y,
            x2: inserted.x + inserted.width,
            y2: inserted.y,
          },
          {
            orientation: 'horizontal',
            kind: 'edge',
            x1: inserted.x,
            y1: inserted.y + inserted.height,
            x2: inserted.x + inserted.width,
            y2: inserted.y + inserted.height,
          },
        ],
      })
    }
  }

  return best
}

/** Commit an insert: shrink neighbors, place the widget in the gap, clear floating. */
export function commitInsert(
  widgets: PlacedWidget[],
  instanceId: string,
  target: InsertTarget,
): PlacedWidget[] {
  return widgets.map((w) => {
    if (w.instanceId === instanceId) {
      const dockSide = target.axis === 'width' ? 'right' : 'bottom'
      return {
        ...w,
        ...target.inserted,
        floating: undefined,
        dock: { targetId: target.primaryId, side: dockSide },
      }
    }
    if (w.instanceId === target.primaryId) {
      return { ...w, ...target.primary }
    }
    if (w.instanceId === target.secondaryId) {
      const dockSide = target.axis === 'width' ? 'right' : 'bottom'
      return {
        ...w,
        ...target.secondary,
        dock: { targetId: instanceId, side: dockSide },
      }
    }
    // Anyone who was docked to the secondary's old parent via this edge
    // keeps their own docks; only rewire docks that pointed at primary
    // as the secondary neighbor.
    if (
      w.dock?.targetId === target.primaryId &&
      ((target.axis === 'width' && w.dock.side === 'right') ||
        (target.axis === 'height' && w.dock.side === 'bottom')) &&
      w.instanceId !== target.secondaryId &&
      w.instanceId !== instanceId
    ) {
      // Leave other right-of-primary docks alone (e.g. another row)
      return w
    }
    return w
  })
}

export type ResizeAlignResult = {
  width: number
  height: number
  guides: AlignGuide[]
}

/**
 * While resizing, return Figma-style guides when near another widget's size/edges.
 * Size is only hard-snapped within SNAP_APPLY_THRESHOLD so you can push through.
 */
export function findResizeAlignment(
  resizing: Rect,
  others: Rect[],
): ResizeAlignResult {
  let bestHeight: {
    dist: number
    height: number
    guides: AlignGuide[]
  } | null = null
  let bestWidth: {
    dist: number
    width: number
    guides: AlignGuide[]
  } | null = null

  const considerH = (dist: number, height: number, guides: AlignGuide[]) => {
    if (dist > SNAP_THRESHOLD) return
    if (height < MIN_H || height > MAX_H) return
    if (!bestHeight || dist < bestHeight.dist) {
      bestHeight = { dist, height, guides }
    }
  }

  const considerW = (dist: number, width: number, guides: AlignGuide[]) => {
    if (dist > SNAP_THRESHOLD) return
    if (width < MIN_W || width > MAX_W) return
    if (!bestWidth || dist < bestWidth.dist) {
      bestWidth = { dist, width, guides }
    }
  }

  for (const other of others) {
    if (other.instanceId === resizing.instanceId) continue

    const sideAdj = isSideAdjacent(resizing, other)
    const stackAdj = isStackAdjacent(resizing, other)
    // Diagonally opposite — no resize snap guides
    if (!sideAdj && !stackAdj) continue

    const gap = liveGapCenter(resizing, other)
    const gapGuides = gap
      ? gapCenterGuidePair(gap.orientation, gap.center, resizing, other)
      : null

    // Equal height / bottom edges — side-adjacent only
    if (sideAdj) {
      {
        const dist = Math.abs(resizing.height - other.height)
        // Prefer gap-center guides; fall back to ideal side gutter if overlapping
        const guides =
          gapGuides ??
          gapCenterGuidePair(
            'vertical',
            other.x > resizing.x
              ? resizing.x + resizing.width + GUTTER_HALF
              : other.x + other.width + GUTTER_HALF,
            resizing,
            other,
          )
        considerH(dist, other.height, guides)
      }

      {
        const otherBottom = other.y + other.height
        const dist = Math.abs(resizing.y + resizing.height - otherBottom)
        const guides =
          gapGuides ??
          gapCenterGuidePair(
            'vertical',
            other.x > resizing.x
              ? resizing.x + resizing.width + GUTTER_HALF
              : other.x + other.width + GUTTER_HALF,
            resizing,
            other,
          )
        considerH(dist, otherBottom - resizing.y, guides)
      }

      {
        const idealRight = other.x - SNAP_GAP
        const gutterCenter = idealRight + GUTTER_HALF
        const dist = Math.abs(resizing.x + resizing.width - idealRight)
        const snappedW = idealRight - resizing.x
        const placed = { ...resizing, width: snappedW }
        considerW(dist, snappedW, [
          ...gapCenterGuidePair('vertical', gutterCenter, placed, other),
        ])
      }
    }

    // Equal width / right edges / stack gutters — stack-adjacent only
    if (stackAdj) {
      {
        const dist = Math.abs(resizing.width - other.width)
        const guides =
          gapGuides ??
          gapCenterGuidePair(
            'horizontal',
            other.y > resizing.y
              ? resizing.y + resizing.height + GUTTER_HALF
              : other.y + other.height + GUTTER_HALF,
            resizing,
            other,
          )
        considerW(dist, other.width, guides)
      }

      {
        const otherRight = other.x + other.width
        const dist = Math.abs(resizing.x + resizing.width - otherRight)
        const guides =
          gapGuides ??
          gapCenterGuidePair(
            'horizontal',
            other.y > resizing.y
              ? resizing.y + resizing.height + GUTTER_HALF
              : other.y + other.height + GUTTER_HALF,
            resizing,
            other,
          )
        considerW(dist, otherRight - resizing.x, guides)
      }

      {
        const idealBottom = other.y - SNAP_GAP
        const gutterCenter = idealBottom + GUTTER_HALF
        const dist = Math.abs(resizing.y + resizing.height - idealBottom)
        const snappedH = idealBottom - resizing.y
        const placed = { ...resizing, height: snappedH }
        considerH(dist, snappedH, [
          ...gapCenterGuidePair('horizontal', gutterCenter, placed, other),
        ])
      }
    }
  }

  // Show guides when near; only hard-snap when very close so resize isn't stuck
  const applyH =
    bestHeight && bestHeight.dist <= SNAP_APPLY_THRESHOLD
      ? bestHeight.height
      : resizing.height
  const applyW =
    bestWidth && bestWidth.dist <= SNAP_APPLY_THRESHOLD
      ? bestWidth.width
      : resizing.width

  return {
    width: applyW,
    height: applyH,
    guides: [...(bestHeight?.guides ?? []), ...(bestWidth?.guides ?? [])],
  }
}
