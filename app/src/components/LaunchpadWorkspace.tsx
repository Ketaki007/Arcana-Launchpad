import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Save,
  ChevronDown,
  Undo2,
  Redo2,
  LayoutTemplate,
  Activity,
  HeartPulse,
  Pencil,
  X,
  Home,
  Copy,
  Trash2,
  Link2,
  Monitor,
} from 'lucide-react'
import { openLaunchpadTab } from '../lib/launchpadWindow'
import {
  getHomeViewId,
  setHomeViewId,
  getAutoLaunchSettings,
  setAutoLaunchSettings,
  type AutoLaunchMode,
} from '../lib/demoHomeView'
import {
  AddWidgetSearch,
  type AddWidgetSearchHandle,
} from './AddWidgetSearch'
import { PromptToView } from './PromptToView'
import type { PromptToViewResult } from '../lib/promptToView'
import { WidgetFrame } from './launchpad/WidgetFrame'
import {
  CatchUpPanel,
  ResearchNotesPanel,
  SendNoteIcon,
  WorkspaceHealthPanel,
} from './launchpad/IntelligentLayers'
import { LAUNCHPAD_WIDGETS, type WidgetDefinition } from '../data/widgets'
import {
  type LaunchpadView,
  type LaunchpadScenario,
  type PlacedWidget,
  type LinkGroupDef,
  type WidgetLinkGroup,
  WORKSPACE_TEMPLATES,
  createBlankView,
  createWidgetInstance,
  createReturningUserViews,
  returningViewIdForKey,
  nextToLastPosition,
  widgetsFromTemplate,
  widgetsFromIds,
  clampWidgetToCanvas,
  clampAllWidgetsToCanvas,
  fitWidgetsToCanvas,
  defaultLinkGroups,
  type ReturningDemoViewKey,
} from '../data/launchpadModel'
import {
  CreateLinkGroupModal,
  ManageLinkGroupsModal,
} from './launchpad/LinkGroupModals'
import {
  findWidgetSnap,
  findResizeAlignment,
  findInsertTarget,
  breakDocksInvolving,
  buildCollectiveGutterHandles,
  resizeCollectiveGroup,
  resizeAffectingSnappedNeighbors,
  commitDock,
  commitInsert,
  type SnapGuide,
  type AlignGuide,
  type CollectiveGutterHandle,
  type InsertTarget,
} from '../lib/widgetSnap'

function readScenario(params: URLSearchParams): LaunchpadScenario {
  return params.get('scenario') === 'returning' ? 'returning' : 'first-time'
}

function readViewKey(params: URLSearchParams): ReturningDemoViewKey | null {
  const view = params.get('view')
  if (
    view === 'us-equities' ||
    view === 'tech-equity' || // legacy deep-link
    view === 'daily-start' ||
    view === 'commodity'
  ) {
    return view === 'tech-equity' ? 'us-equities' : view
  }
  return null
}

function initialStateFromScenario(
  scenario: LaunchpadScenario,
  options: {
    viewKey?: ReturningDemoViewKey | null
    viewId?: string | null
    createNew?: boolean
  } = {},
): {
  views: LaunchpadView[]
  activeViewId: string | null
  activePageId: string | null
} {
  if (scenario === 'returning') {
    const views = createReturningUserViews()
    if (options.createNew) {
      return { views, activeViewId: null, activePageId: null }
    }
    const preferredId =
      options.viewId ??
      (options.viewKey ? returningViewIdForKey(options.viewKey) : null) ??
      getHomeViewId()
    const active = views.find((v) => v.id === preferredId) ?? views[0] ?? null
    return {
      views,
      activeViewId: active?.id ?? null,
      activePageId: active?.pages[0]?.id ?? null,
    }
  }
  return { views: [], activeViewId: null, activePageId: null }
}

export function LaunchpadWorkspace() {
  const [searchParams] = useSearchParams()
  const scenario = readScenario(searchParams)
  const viewKey = readViewKey(searchParams)
  const viewId = searchParams.get('viewId')
  const createNew = searchParams.get('new') === '1'
  /**
   * Walkthrough / Figma capture:
   * add-widget | add-widget-multi | add-widget-search | widgets-all | save |
   * widget-removed | link-menu | manage-links |
   * catch-up | health | research-notes | research-notes-assembled | research-notes-sent |
   * save-home (Save View with Set as home + Launch automatically checked)
   */
  const demo = searchParams.get('demo')
  const widgetRemovedDemoApplied = useRef(false)
  const seeded = initialStateFromScenario(scenario, {
    viewKey,
    viewId,
    createNew,
  })

  const [views, setViews] = useState<LaunchpadView[]>(seeded.views)
  const [activeViewId, setActiveViewId] = useState<string | null>(
    seeded.activeViewId,
  )
  const [activePageId, setActivePageId] = useState<string | null>(
    seeded.activePageId,
  )
  const [draftName, setDraftName] = useState('New View 1')
  const [draftWidgets, setDraftWidgets] = useState<PlacedWidget[]>([])
  const [draftLinkGroups, setDraftLinkGroups] = useState<LinkGroupDef[]>(() =>
    defaultLinkGroups(),
  )
  /** Template loaded onto the draft canvas (not a saved view). */
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveDialogName, setSaveDialogName] = useState('')
  /** Structure signature of the active view when it was last loaded/saved. */
  const [viewBaseline, setViewBaseline] = useState<string | null>(null)
  const [saveSetAsHome, setSaveSetAsHome] = useState(false)
  const [saveAutoLaunch, setSaveAutoLaunch] = useState(false)
  const [saveAutoLaunchMode, setSaveAutoLaunchMode] = useState<
    'on-arcana' | 'scheduled'
  >('on-arcana')
  const [saveAutoLaunchTime, setSaveAutoLaunchTime] = useState('09:00')
  const [homeViewId, setHomeViewIdState] = useState(() => getHomeViewId())
  const [homeReplaceOpen, setHomeReplaceOpen] = useState(false)
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  /** Per link-group shared security context on the active page. */
  const [groupTickers, setGroupTickers] = useState<Record<string, string>>(
    () => ({ 'lg-a': 'NVDA', 'lg-b': 'AAPL', 'lg-c': 'MSFT' }),
  )
  const selectedTicker = groupTickers['lg-a'] ?? 'NVDA'
  const [linkModal, setLinkModal] = useState<'create' | 'manage' | null>(null)
  const [maximizedId, setMaximizedId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [snapGuide, setSnapGuide] = useState<SnapGuide | null>(null)
  const [insertTarget, setInsertTarget] = useState<InsertTarget | null>(null)
  const [alignGuides, setAlignGuides] = useState<AlignGuide[]>([])
  const snapGuideRef = useRef<SnapGuide | null>(null)
  const insertTargetRef = useRef<InsertTarget | null>(null)
  const [showCatchUp, setShowCatchUp] = useState(false)
  /** Badge/glow on Catch-up icon — available but not auto-opened. */
  const [catchUpAvailable, setCatchUpAvailable] = useState(false)
  const [showComposer, setShowComposer] = useState(false)
  const [showHealth, setShowHealth] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const addWidgetRef = useRef<AddWidgetSearchHandle>(null)
  const workspaceBodyRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(() =>
    typeof window !== 'undefined'
      ? Math.max(640, window.innerWidth - 48)
      : 1200,
  )
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined'
      ? Math.max(400, window.innerHeight - 120)
      : 800,
  )

  useEffect(() => {
    const el = workspaceBodyRef.current
    if (!el) return
    const update = () => {
      setCanvasWidth(el.clientWidth)
      setViewportHeight(el.clientHeight)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Re-seed when scenario / deep-link query changes.
  // Do NOT depend on canvasWidth/viewportHeight — opening Catch-up / Research Notes
  // shrinks the workspace and would otherwise re-run this effect and close those panels.
  useEffect(() => {
    const next = initialStateFromScenario(scenario, {
      viewKey,
      viewId,
      createNew,
    })
    setViews(next.views)
    setActiveViewId(next.activeViewId)
    setActivePageId(next.activePageId)
    setMaximizedId(null)
    setShowComposer(false)
    setShowHealth(false)
    setDraftName(nextNewViewName(next.views))
    setActiveTemplateId(null)
    setEditingName(false)
    setSnapGuide(null)
    setInsertTarget(null)
    setAlignGuides([])
    setMovingId(null)
    setShowCatchUp(false)
    // Returning to a saved view after time away → signal Catch-up, don't force it open
    setCatchUpAvailable(scenario === 'returning' && !createNew)

    const seedAll =
      demo === 'widgets-all' || demo === 'save' || demo === 'save-home'
    if (seedAll) {
      // First-time canvas: newly added widgets start unlinked (None), not Group A
      setDraftWidgets(
        widgetsFromIds(
          LAUNCHPAD_WIDGETS.map((w) => w.id),
          Math.max(canvasWidth, 1400),
          Math.max(viewportHeight, 800),
          null,
        ),
      )
    } else {
      setDraftWidgets([])
    }

    if (demo === 'save' || demo === 'save-home') {
      setSaveDialogName('New View 1')
      setSaveDialogOpen(true)
      setSaveSetAsHome(demo === 'save-home')
      setSaveAutoLaunch(demo === 'save-home')
      setSaveAutoLaunchMode('on-arcana')
    } else {
      setSaveDialogOpen(false)
      setSaveSetAsHome(false)
      setSaveAutoLaunch(false)
    }
    // canvasWidth / viewportHeight: read at scenario/demo change only (not on resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, viewKey, viewId, createNew, demo])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const [editingName, setEditingName] = useState(false)

  const activeView = views.find((v) => v.id === activeViewId) ?? null
  const activePage =
    activeView?.pages.find((p) => p.id === activePageId) ??
    activeView?.pages[0] ??
    null
  const widgets = activePage?.widgets ?? draftWidgets
  const pageLinkGroups =
    activePage?.linkGroups ??
    (activePage ? defaultLinkGroups() : draftLinkGroups)

  const viewIsDirty = Boolean(
    activeView &&
      viewBaseline != null &&
      viewContentSignature(activeView) !== viewBaseline,
  )

  // Capture a clean baseline when switching to a saved view (not on every edit)
  useEffect(() => {
    if (!activeViewId) {
      setViewBaseline(null)
      return
    }
    const view = views.find((v) => v.id === activeViewId)
    if (!view) {
      setViewBaseline(null)
      return
    }
    setViewBaseline(viewContentSignature(view))
    // Switching views after being away — surface Catch-up availability (non-intrusive)
    if (scenario === 'returning') {
      setCatchUpAvailable(true)
    }
    // Only reset when the selected view identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeViewId])

  // Demo: US Equities with one widget removed → dirty header ("Save Changes to view")
  useEffect(() => {
    if (demo !== 'widget-removed') {
      widgetRemovedDemoApplied.current = false
      return
    }
    if (!activeViewId || viewBaseline == null || widgetRemovedDemoApplied.current) {
      return
    }
    widgetRemovedDemoApplied.current = true
    setShowCatchUp(false)
    setCatchUpAvailable(false)
    setViews((prev) =>
      prev.map((view) => {
        if (view.id !== activeViewId) return view
        const page = view.pages[0]
        if (!page || page.widgets.length === 0) return view
        const removeId =
          page.widgets.find((w) => w.id === 'news-feed')?.instanceId ??
          page.widgets[page.widgets.length - 1]!.instanceId
        return {
          ...view,
          pages: view.pages.map((p, index) => {
            if (index !== 0) return p
            return {
              ...p,
              widgets: p.widgets
                .filter((w) => w.instanceId !== removeId)
                .map((w) =>
                  w.dock?.targetId === removeId
                    ? { ...w, dock: undefined }
                    : w,
                ),
            }
          }),
        }
      }),
    )
  }, [demo, activeViewId, viewBaseline])

  // Demo: Force panel / modal states for Figma walkthroughs
  useEffect(() => {
    if (demo === 'manage-links') {
      setShowCatchUp(false)
      setShowComposer(false)
      setShowHealth(false)
      setCatchUpAvailable(false)
      setLinkModal('manage')
      return
    }
    if (demo === 'link-menu') {
      setShowCatchUp(false)
      setShowComposer(false)
      setShowHealth(false)
      setCatchUpAvailable(false)
      setLinkModal(null)
      return
    }
    if (demo === 'catch-up') {
      setLinkModal(null)
      setShowComposer(false)
      setShowHealth(false)
      setShowCatchUp(true)
      setCatchUpAvailable(false)
      return
    }
    if (demo === 'health') {
      setLinkModal(null)
      setShowCatchUp(false)
      setShowComposer(false)
      setShowHealth(true)
      setCatchUpAvailable(false)
      return
    }
    if (
      demo === 'research-notes' ||
      demo === 'research-notes-assembled' ||
      demo === 'research-notes-sent'
    ) {
      setLinkModal(null)
      setShowCatchUp(false)
      setShowHealth(false)
      setShowComposer(true)
      setCatchUpAvailable(false)
      return
    }
    if (demo !== 'save' && demo !== 'save-home') {
      setLinkModal(null)
    }
  }, [demo])

  function cycleView(delta: number) {
    if (views.length === 0) return
    const index = Math.max(
      0,
      views.findIndex((v) => v.id === activeViewId),
    )
    const next = views[(index + delta + views.length) % views.length]!
    setActiveViewId(next.id)
    setActivePageId(next.pages[0]?.id ?? null)
    setActiveTemplateId(null)
    setViewMenuOpen(false)
  }

  function cyclePage(delta: number) {
    if (!activeView || activeView.pages.length === 0) return
    const index = Math.max(
      0,
      activeView.pages.findIndex((p) => p.id === activePageId),
    )
    const next =
      activeView.pages[
        (index + delta + activeView.pages.length) % activeView.pages.length
      ]!
    setActivePageId(next.id)
  }

  function setAsHomeFromShortcut() {
    if (!activeView) {
      setToast('Save a view first to set it as home')
      return
    }
    if (activeView.id === homeViewId) {
      setToast(`“${activeView.name}” is already home`)
      return
    }
    if (homeViewId && homeViewId !== activeView.id) {
      setHomeReplaceOpen(true)
      return
    }
    setHomeViewId(activeView.id)
    setHomeViewIdState(activeView.id)
    setToast(`“${activeView.name}” set as home`)
  }

  // Workstation shortcuts (Ctrl on Win/Linux, ⌘ on macOS)
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false
      const tag = target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
      if (target.isContentEditable) return true
      return false
    }

    function onKeyDown(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey
      if (!mod || e.altKey) return

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const typing = isTypingTarget(e.target)

      // Ctrl/Cmd+S — save changes in place when dirty; otherwise open Save dialog
      if (!e.shiftKey && key === 's') {
        e.preventDefault()
        if (viewIsDirty && activeView) {
          saveChangesToView()
        } else {
          openSaveDialog()
        }
        return
      }

      if (!e.shiftKey) return

      // Allow Add widget from a field; block other chords while typing
      if (typing && key !== 'w' && key !== 'W') return

      if (key === 'w' || key === 'W') {
        e.preventDefault()
        addWidgetRef.current?.open()
        return
      }
      if (key === 'p' || key === 'P') {
        e.preventDefault()
        if (!activeViewId || !activeView) {
          setToast('Select a saved view to add a page')
          return
        }
        addPage()
        return
      }
      if (key === 'h' || key === 'H') {
        e.preventDefault()
        setAsHomeFromShortcut()
        return
      }
      if (key === 'u' || key === 'U') {
        e.preventDefault()
        if (scenario === 'first-time') return
        setShowComposer(false)
        setShowCatchUp(true)
        setCatchUpAvailable(false)
        return
      }
      if (key === 'r' || key === 'R') {
        e.preventDefault()
        setShowCatchUp(false)
        setShowComposer(true)
        return
      }
      if (key === 'ArrowRight') {
        e.preventDefault()
        cycleView(1)
        return
      }
      if (key === 'ArrowLeft') {
        e.preventDefault()
        cycleView(-1)
        return
      }
      if (key === 'ArrowDown') {
        e.preventDefault()
        cyclePage(1)
        return
      }
      if (key === 'ArrowUp') {
        e.preventDefault()
        cyclePage(-1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // Helpers close over current view/page state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    views,
    activeViewId,
    activeView,
    activePageId,
    homeViewId,
    scenario,
    viewIsDirty,
  ])

  /** Mutate widgets on the active saved page, or on the unsaved draft canvas. */
  function updateWidgets(
    updater: (pageWidgets: PlacedWidget[]) => PlacedWidget[],
  ) {
    if (activeViewId && activePage) {
      setViews((prev) =>
        prev.map((view) => {
          if (view.id !== activeViewId) return view
          return {
            ...view,
            pages: view.pages.map((page) =>
              page.id === activePage.id
                ? { ...page, widgets: updater(page.widgets) }
                : page,
            ),
          }
        }),
      )
      return
    }
    setDraftWidgets((prev) => updater(prev))
  }

  function tickerForWidget(widget: PlacedWidget): string {
    if (widget.linkGroup) {
      return groupTickers[widget.linkGroup] ?? widget.config.security ?? 'NVDA'
    }
    return widget.config.security || selectedTicker
  }

  /** Propagate security selection within a link group (or only to self if None). */
  function applyGroupSelection(source: PlacedWidget, ticker: string) {
    if (!source.linkGroup) {
      updateWidgets((list) =>
        list.map((w) =>
          w.instanceId === source.instanceId
            ? { ...w, config: { ...w.config, security: ticker } }
            : w,
        ),
      )
      return
    }
    const group = source.linkGroup
    setGroupTickers((prev) => ({ ...prev, [group]: ticker }))
    updateWidgets((list) =>
      list.map((w) =>
        w.linkGroup === group
          ? { ...w, config: { ...w.config, security: ticker } }
          : w,
      ),
    )
  }

  function setWidgetLinkGroup(instanceId: string, group: WidgetLinkGroup) {
    updateWidgets((list) =>
      list.map((w) => {
        if (w.instanceId !== instanceId) return w
        if (!group) return { ...w, linkGroup: null }
        return {
          ...w,
          linkGroup: group,
          config: {
            ...w.config,
            security: groupTickers[group] ?? w.config.security ?? 'NVDA',
          },
        }
      }),
    )
  }

  function updatePageLinkGroups(next: LinkGroupDef[]) {
    if (activeViewId && activePage) {
      setViews((prev) =>
        prev.map((view) => {
          if (view.id !== activeViewId) return view
          return {
            ...view,
            pages: view.pages.map((page) =>
              page.id === activePage.id
                ? { ...page, linkGroups: next }
                : page,
            ),
          }
        }),
      )
      return
    }
    setDraftLinkGroups(next)
  }

  function createLinkGroup(group: LinkGroupDef, memberIds: string[]) {
    const members = new Set(memberIds)
    updatePageLinkGroups([...pageLinkGroups, group])
    setGroupTickers((prev) => ({ ...prev, [group.id]: 'NVDA' }))
    updateWidgets((list) =>
      list.map((w) =>
        members.has(w.instanceId)
          ? {
              ...w,
              linkGroup: group.id,
              config: { ...w.config, security: 'NVDA' },
            }
          : w,
      ),
    )
    setLinkModal(null)
    setToast(`Created “${group.name}”`)
  }

  // Stretch tiled widgets to fill the viewport when the canvas (or page) changes
  useEffect(() => {
    if (canvasWidth <= 0) return
    updateWidgets((list) =>
      fitWidgetsToCanvas(list, canvasWidth, viewportHeight),
    )
    // updateWidgets closes over active view; re-run when size or page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, viewportHeight, activeViewId, activePageId])

  const saveSummary = useMemo(() => {
    if (activeView) {
      const pageCount = activeView.pages.length
      const widgetCount = activeView.pages.reduce(
        (n, p) => n + p.widgets.length,
        0,
      )
      return { pageCount, widgetCount }
    }
    return { pageCount: 1, widgetCount: draftWidgets.length }
  }, [activeView, draftWidgets.length])

  /** Open save dialog so the user can confirm the name (new view / save as). */
  function openSaveDialog() {
    const suggested = viewIsDirty && activeView
      ? `${activeView.name} (copy)`
      : draftName.trim() ||
        activeView?.name ||
        nextNewViewName(views)
    const auto = getAutoLaunchSettings()
    setSaveDialogName(suggested)
    setSaveSetAsHome(false)
    setSaveAutoLaunch(false)
    setSaveAutoLaunchMode(
      auto.mode === 'scheduled' ? 'scheduled' : 'on-arcana',
    )
    setSaveAutoLaunchTime(auto.time || '09:00')
    setSaveDialogOpen(true)
  }

  /** Persist edits on the currently open saved view (no rename dialog). */
  function saveChangesToView() {
    if (!activeView) return
    setViewBaseline(viewContentSignature(activeView))
    setToast(`Changes saved to “${activeView.name}”`)
  }

  function applySaveOptions(view: LaunchpadView) {
    if (saveSetAsHome) {
      setHomeViewId(view.id)
      setHomeViewIdState(view.id)
    }
    if (saveAutoLaunch) {
      const mode: AutoLaunchMode = saveAutoLaunchMode
      setAutoLaunchSettings({
        mode,
        time: saveAutoLaunchTime,
        viewId: saveSetAsHome ? view.id : getHomeViewId(),
      })
    } else {
      const prev = getAutoLaunchSettings()
      setAutoLaunchSettings({ ...prev, mode: 'off' })
    }
  }

  /** Persist as a saved view. Never auto-selects it. */
  function confirmSaveView() {
    const name = saveDialogName.trim()
    if (!name) return

    // New saved view gets a new id — replacing home needs confirmation
    if (saveSetAsHome && views.some((v) => v.id === homeViewId)) {
      setHomeReplaceOpen(true)
      return
    }

    finishSaveView()
  }

  function finishSaveView() {
    const name = saveDialogName.trim()
    if (!name) return

    let view: LaunchpadView
    if (activeView) {
      view = {
        id: `view-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        pages: activeView.pages.map((p) => ({
          ...p,
          id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          widgets: p.widgets.map((w) => ({
            ...w,
            instanceId: `${w.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          })),
        })),
      }
    } else {
      view = createBlankView(name)
      view.pages[0]!.widgets = draftWidgets
      view.pages[0]!.linkGroups = draftLinkGroups
    }

    applySaveOptions(view)
    setViews((prev) => [...prev, view])
    setSaveDialogOpen(false)
    setHomeReplaceOpen(false)
    setDraftName(nextNewViewName([...views, view]))
    setDraftWidgets([])
    setDraftLinkGroups(defaultLinkGroups())
    setActiveTemplateId(null)
    setActiveViewId(null)
    setActivePageId(null)
    setViewMenuOpen(false)

    const bits = [`View “${view.name}” saved`]
    if (saveSetAsHome) bits.push('set as home')
    if (saveAutoLaunch) {
      bits.push(
        saveAutoLaunchMode === 'scheduled'
          ? `auto-launch at ${saveAutoLaunchTime}`
          : 'auto-launch when Arcana opens',
      )
    }
    setToast(bits.join(' · '))
  }

  /** Apply a template onto the draft canvas only — does not save or select a view. */
  function applyTemplate(templateId: string) {
    const label = templateLabel(templateId)
    setActiveViewId(null)
    setActivePageId(null)
    setActiveTemplateId(templateId)
    setDraftName(label)
    setDraftWidgets(
      clampAllWidgetsToCanvas(
        widgetsFromTemplate(templateId, canvasWidth, viewportHeight),
        canvasWidth,
      ),
    )
    setMaximizedId(null)
    setViewMenuOpen(false)
    setToast(`Loaded “${label}” — name it and Save View to keep it`)
  }

  /** Prompt → draft view: assemble widgets from natural-language intent. */
  function applyPromptToView(result: PromptToViewResult) {
    setActiveViewId(null)
    setActivePageId(null)
    setActiveTemplateId(null)
    setDraftName(result.suggestedName)
    setDraftWidgets(
      clampAllWidgetsToCanvas(
        widgetsFromIds(result.widgetIds, canvasWidth, viewportHeight),
        canvasWidth,
      ),
    )
    if (result.tickers[0]) {
      const primary = result.tickers[0]
      setGroupTickers((prev) => ({
        ...prev,
        'lg-a': primary,
        ...(result.tickers[1] ? { 'lg-b': result.tickers[1] } : {}),
        ...(result.tickers[2] ? { 'lg-c': result.tickers[2] } : {}),
      }))
    }
    setMaximizedId(null)
    setToast(result.rationale)
  }

  function selectView(id: string) {
    const view = views.find((v) => v.id === id)
    if (!view) return
    setActiveViewId(id)
    setActivePageId(view.pages[0]?.id ?? null)
    setActiveTemplateId(null)
    setViewMenuOpen(false)
  }

  function addPage() {
    if (!activeViewId || !activeView) return
    const page = {
      id: `page-${Date.now()}`,
      name: `Page ${activeView.pages.length + 1}`,
      widgets: [] as PlacedWidget[],
      linkGroups: defaultLinkGroups(),
    }
    setViews((prev) =>
      prev.map((v) =>
        v.id === activeViewId ? { ...v, pages: [...v.pages, page] } : v,
      ),
    )
    setActivePageId(page.id)
  }

  function duplicateView() {
    if (!activeView) return
    const copy: LaunchpadView = {
      id: `view-${Date.now()}`,
      name: `${activeView.name} (copy)`,
      pages: activeView.pages.map((p) => ({
        ...p,
        id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        widgets: p.widgets.map((w) => ({
          ...w,
          instanceId: `${w.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          dock: undefined,
        })),
      })),
    }
    setViews((prev) => [...prev, copy])
    setToast(`“${copy.name}” added to My views`)
  }

  function deleteView() {
    if (!activeView) return
    const removing = activeView
    const remaining = views.filter((v) => v.id !== removing.id)
    setViews(remaining)

    if (removing.id === homeViewId) {
      const nextHome = remaining[0]
      if (nextHome) {
        setHomeViewId(nextHome.id)
        setHomeViewIdState(nextHome.id)
      }
    }

    const next = remaining[0] ?? null
    setActiveViewId(next?.id ?? null)
    setActivePageId(next?.pages[0]?.id ?? null)
    setMaximizedId(null)
    setToast(`“${removing.name}” deleted`)
  }

  function placeWidgetOnList(
    list: PlacedWidget[],
    def: WidgetDefinition,
  ): PlacedWidget[] {
    const pos = nextToLastPosition(list, canvasWidth, viewportHeight)
    const placed = clampWidgetToCanvas(
      createWidgetInstance(def, list.length, pos),
      canvasWidth,
    )
    if (pos.floating) {
      placed.floating = true
      return [...list, placed]
    }
    const tiled = list.filter((w) => !w.floating)
    const last = tiled[tiled.length - 1]
    if (last && !pos.wrapped) {
      placed.dock = { targetId: last.instanceId, side: 'right' }
    } else if (last && pos.wrapped) {
      const rowMates = tiled.filter((w) => Math.abs(w.y - last.y) <= 24)
      const anchor = rowMates.reduce((a, b) => (a.x <= b.x ? a : b))
      placed.dock = { targetId: anchor.instanceId, side: 'bottom' }
    }
    return [...list, placed]
  }

  function addWidget(def: WidgetDefinition) {
    updateWidgets((list) => placeWidgetOnList(list, def))
  }

  function addWidgets(defs: WidgetDefinition[]) {
    if (defs.length === 0) return
    updateWidgets((list) =>
      defs.reduce((acc, def) => placeWidgetOnList(acc, def), list),
    )
  }

  function removeWidget(instanceId: string) {
    updateWidgets((list) =>
      list
        .filter((w) => w.instanceId !== instanceId)
        .map((w) =>
          w.dock?.targetId === instanceId ? { ...w, dock: undefined } : w,
        ),
    )
    if (maximizedId === instanceId) setMaximizedId(null)
  }

  function updateWidgetLayout(
    instanceId: string,
    layout: { x?: number; y?: number; width?: number; height?: number },
  ) {
    const current = widgets.find((w) => w.instanceId === instanceId)
    if (!current) return

    // Resize from any edge/corner — push/pull snapped neighbors on moving edges
    if (layout.width !== undefined || layout.height !== undefined) {
      const proposed = clampWidgetToCanvas(
        {
          ...current,
          ...layout,
          y: layout.y ?? current.y,
        },
        canvasWidth,
      )
      // Keep y from layout (clamp only constrains x/width)
      const withY = { ...proposed, y: Math.max(0, layout.y ?? current.y) }
      const align = findResizeAlignment(
        withY,
        widgets.filter((w) => w.instanceId !== instanceId),
      )
      // When resizing from left/top, preserve the moved edge after width snap
      let snappedX = withY.x
      let snappedY = withY.y
      if (layout.x !== undefined && align.width !== withY.width) {
        // Left edge was moving — keep right edge fixed when width snaps
        const right = current.x + current.width
        if (Math.abs((layout.x ?? current.x) - current.x) > 0.5) {
          snappedX = Math.max(0, right - align.width)
        }
      }
      if (layout.y !== undefined && align.height !== withY.height) {
        const bottom = current.y + current.height
        if (Math.abs((layout.y ?? current.y) - current.y) > 0.5) {
          snappedY = Math.max(0, bottom - align.height)
        }
      }
      const snapped = clampWidgetToCanvas(
        {
          ...withY,
          x: snappedX,
          y: snappedY,
          width: align.width,
          height: align.height,
        },
        canvasWidth,
      )
      updateWidgets((list) =>
        clampAllWidgetsToCanvas(
          resizeAffectingSnappedNeighbors(list, instanceId, {
            x: snapped.x,
            y: snappedY,
            width: snapped.width,
            height: align.height,
          }),
          canvasWidth,
        ),
      )
      setAlignGuides(align.guides)
      setSnapGuide(null)
      return
    }

    // Move: free position; prefer insert-between when over a tiled gutter
    const proposed = clampWidgetToCanvas(
      { ...current, ...layout },
      canvasWidth,
    )
    const proposedRect = {
      ...proposed,
      y: layout.y ?? current.y,
      instanceId: current.instanceId,
      width: current.width,
      height: current.height,
    }
    const others = widgets.filter((w) => w.instanceId !== instanceId)
    const insert = findInsertTarget(proposedRect, others)

    updateWidgets((list) =>
      clampAllWidgetsToCanvas(
        list.map((w) =>
          w.instanceId === instanceId
            ? {
                ...w,
                // Preview slot position without resizing until drop
                x: insert ? insert.inserted.x : proposed.x,
                y: insert ? insert.inserted.y : (layout.y ?? current.y),
              }
            : w,
        ),
        canvasWidth,
      ),
    )

    if (insert) {
      insertTargetRef.current = insert
      snapGuideRef.current = null
      setInsertTarget(insert)
      setSnapGuide(null)
      setAlignGuides([])
      return
    }

    insertTargetRef.current = null
    setInsertTarget(null)
    if (layout.x !== undefined || layout.y !== undefined) {
      const snap = findWidgetSnap(proposedRect, others)
      snapGuideRef.current = snap
      setSnapGuide(snap)
      setAlignGuides([])
    }
  }

  function finishMove() {
    const insert = insertTargetRef.current
    const snap = snapGuideRef.current
    if (movingId && insert) {
      updateWidgets((list) =>
        clampAllWidgetsToCanvas(
          commitInsert(list, movingId, insert),
          canvasWidth,
        ),
      )
    } else if (movingId && snap) {
      updateWidgets((list) => commitDock(list, movingId, snap))
    }
    // If no snap, docks were already broken on drag start
    setMovingId(null)
    snapGuideRef.current = null
    insertTargetRef.current = null
    setSnapGuide(null)
    setInsertTarget(null)
  }

  function finishResize() {
    setAlignGuides([])
  }

  function applyCollectiveGutterResize(
    handle: CollectiveGutterHandle,
    delta: number,
    origins: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >,
  ) {
    updateWidgets((list) =>
      clampAllWidgetsToCanvas(
        resizeCollectiveGroup(list, handle, delta, origins),
        canvasWidth,
      ),
    )
  }

  const collectiveHandles = useMemo(
    () => buildCollectiveGutterHandles(widgets),
    [widgets],
  )

  const contentHeight = useMemo(() => {
    if (widgets.length === 0) return Math.max(600, viewportHeight)
    return Math.max(
      viewportHeight,
      ...widgets.map((w) => w.y + w.height + 24),
    )
  }, [widgets, viewportHeight])

  const isFirstTime = scenario === 'first-time'
  /** Duplicate types on the page — treated as unused for health summary. */
  const unusedWidgetCount = useMemo(() => {
    const seen = new Map<string, number>()
    for (const w of widgets) {
      seen.set(w.id, (seen.get(w.id) ?? 0) + 1)
    }
    let unused = 0
    for (const count of seen.values()) {
      if (count > 1) unused += count - 1
    }
    return unused
  }, [widgets])

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-bg text-text">
      <header className="flex h-8 shrink-0 items-center border-b border-border bg-bg-elevated">
        <div className="flex h-full items-center border-r border-border px-3">
          <span className="text-[12px] font-semibold tracking-tight">
            Launchpad
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-stretch">
          {/* View identity: name a draft or pick a saved view / template */}
          <div className="flex items-center gap-1.5 border-r border-border px-2">
            {!activeView ? (
              <ViewNameField
                value={draftName}
                placeholder="New View 1"
                editing={editingName}
                inputRef={inputRef}
                onEditingChange={setEditingName}
                onChange={setDraftName}
                onCommit={() => setEditingName(false)}
              />
            ) : null}

            {!activeView ? (
              <span className="px-0.5 text-[11px] text-text-muted">or</span>
            ) : null}

            <ViewsDropdown
              views={views}
              activeViewId={activeViewId}
              homeViewId={homeViewId}
              activeTemplateId={activeTemplateId}
              open={viewMenuOpen}
              onOpenChange={setViewMenuOpen}
              onSelectView={selectView}
              onSelectTemplate={applyTemplate}
              onOpenViewInScreen={(viewId, screen) => {
                const view = views.find((v) => v.id === viewId)
                openLaunchpadTab({
                  scenario: 'returning',
                  viewId,
                  screen,
                })
                setToast(
                  `Opening “${view?.name ?? 'view'}” on screen ${screen}`,
                )
              }}
            />
          </div>

          {/* Assemble */}
          <div className="flex items-center gap-1.5 border-r border-border px-2">
            <AddWidgetSearch
              ref={addWidgetRef}
              onAddWidget={addWidget}
              onAddWidgets={addWidgets}
              demoMode={
                demo === 'add-widget'
                  ? 'open'
                  : demo === 'add-widget-multi'
                    ? 'multi'
                    : demo === 'add-widget-typed'
                      ? 'search'
                      : demo === 'add-widget-search'
                        ? 'search-multi'
                        : null
              }
            />
            {/* Prompt to view — only while creating a new (unsaved) view */}
            {!activeView ? (
              <PromptToView onGenerate={(result) => applyPromptToView(result)} />
            ) : null}
          </div>

          {/* Pages */}
          <PageTabs
            pages={
              activeView?.pages.map((p) => ({ id: p.id, name: p.name })) ?? [
                { id: 'placeholder', name: 'Page 1' },
              ]
            }
            activePageId={activePageId ?? 'placeholder'}
            onSelectPage={(id) => {
              if (activeView) setActivePageId(id)
            }}
            onAddPage={addPage}
            canEdit={Boolean(activeView)}
          />

          {/* History + save */}
          <button
            type="button"
            className="inline-flex w-7 items-center justify-center border-l border-border text-text-muted hover:text-text"
            aria-label="Undo"
          >
            <Undo2 size={12} />
          </button>
          <button
            type="button"
            className="inline-flex w-7 items-center justify-center border-r border-border text-text-muted/40"
            aria-label="Redo"
            disabled
          >
            <Redo2 size={12} />
          </button>

          <div className="flex items-center gap-4 border-r border-border px-2">
            <button
              type="button"
              onClick={() => setLinkModal('manage')}
              className="inline-flex h-6 w-6 items-center justify-center text-text-secondary hover:text-text"
              title="Manage groups and linkages"
              aria-label="Manage groups and linkages"
            >
              <Link2 size={13} />
            </button>
            <label
              className={[
                'inline-flex h-6 items-center gap-1.5 text-[11px]',
                activeView
                  ? 'cursor-pointer text-text-secondary hover:text-text'
                  : 'cursor-not-allowed text-text-muted/50',
              ].join(' ')}
              title={
                activeView
                  ? 'Home opens when you click Launchpad or when Arcana starts'
                  : 'Save or select a view first'
              }
            >
              <input
                type="checkbox"
                checked={Boolean(activeView && activeView.id === homeViewId)}
                disabled={!activeView}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAsHomeFromShortcut()
                    return
                  }
                  // One home is always required — unchecking does not clear it
                  setToast('Select another view to change home')
                }}
                className="h-3 w-3 shrink-0 accent-[var(--color-selection)] disabled:opacity-40"
              />
              Set as home view
            </label>
            <button
              type="button"
              onClick={duplicateView}
              disabled={!activeView}
              className="inline-flex h-6 w-6 items-center justify-center text-text-secondary hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
              title="Clone view"
              aria-label="Clone view"
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              onClick={deleteView}
              disabled={!activeView}
              className="inline-flex h-6 w-6 items-center justify-center text-text-secondary hover:text-negative disabled:cursor-not-allowed disabled:opacity-40"
              title="Delete view"
              aria-label="Delete view"
            >
              <Trash2 size={13} />
            </button>
            {viewIsDirty ? (
              <>
                <button
                  type="button"
                  onClick={openSaveDialog}
                  className="h-6 text-[11px] text-text-secondary hover:text-text"
                >
                  Save as new view
                </button>
                <button
                  type="button"
                  onClick={saveChangesToView}
                  className="inline-flex h-6 items-center gap-1 rounded-[2px] bg-selection px-2 text-[11px] font-medium text-white hover:bg-[#2563eb]"
                >
                  <Save size={11} />
                  Save Changes to view
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openSaveDialog}
                className="inline-flex h-6 items-center gap-1 rounded-[2px] bg-selection px-2 text-[11px] font-medium text-white hover:bg-[#2563eb]"
              >
                <Save size={11} />
                Save View
              </button>
            )}
          </div>

          <div className="ml-auto flex items-stretch border-l border-border">
            {!isFirstTime && (
              <button
                type="button"
                onClick={() => {
                  setShowComposer(false)
                  setShowCatchUp(true)
                  setCatchUpAvailable(false)
                }}
                className={[
                  'relative inline-flex w-7 items-center justify-center hover:bg-panel',
                  showCatchUp
                    ? 'text-selection'
                    : 'text-text-secondary hover:text-text',
                ].join(' ')}
                title={
                  catchUpAvailable
                    ? 'Workspace Catch-up available — updates since your last session'
                    : 'Workspace Catch-up'
                }
                aria-label={
                  catchUpAvailable
                    ? 'Workspace Catch-up available'
                    : 'Workspace Catch-up'
                }
              >
                <Activity size={13} />
                {catchUpAvailable ? (
                  <span
                    className="catchup-badge absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-selection"
                    aria-hidden
                  />
                ) : null}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowCatchUp(false)
                setShowComposer(true)
              }}
              className={[
                'inline-flex w-7 items-center justify-center hover:bg-panel',
                showComposer
                  ? 'text-selection'
                  : 'text-text-secondary hover:text-text',
              ].join(' ')}
              title="Research Notes (Ctrl+Shift+R)"
              aria-label="Research Notes"
            >
              <SendNoteIcon size={14} />
            </button>
            {!isFirstTime && (
              <div className="relative flex items-stretch">
                <button
                  type="button"
                  onClick={() => setShowHealth((v) => !v)}
                  className={[
                    'inline-flex w-7 items-center justify-center hover:bg-panel',
                    showHealth
                      ? 'text-selection'
                      : 'text-text-secondary hover:text-text',
                  ].join(' ')}
                  title="Workspace Health"
                  aria-label="Workspace Health"
                  aria-expanded={showHealth}
                >
                  <HeartPulse size={13} />
                </button>
                {showHealth ? (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label="Close workspace health"
                      onClick={() => setShowHealth(false)}
                    />
                    <WorkspaceHealthPanel
                      widgetCount={widgets.length}
                      unusedCount={unusedWidgetCount}
                      onClose={() => setShowHealth(false)}
                    />
                  </>
                ) : null}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setDraftName(nextNewViewName(views))
                setDraftWidgets([])
                setActiveTemplateId(null)
                setActiveViewId(null)
                setActivePageId(null)
                setEditingName(false)
                setMaximizedId(null)
              }}
              className="inline-flex items-center gap-1 border-l border-border px-2.5 text-[11px] text-text-secondary hover:bg-panel hover:text-text"
            >
              <Plus size={11} />
              New View
            </button>
          </div>
        </div>
      </header>

      {saveDialogOpen ? (
        <SaveViewDialog
          name={saveDialogName}
          pageCount={saveSummary.pageCount}
          widgetCount={saveSummary.widgetCount}
          setAsHome={saveSetAsHome}
          autoLaunch={saveAutoLaunch}
          autoLaunchMode={saveAutoLaunchMode}
          autoLaunchTime={saveAutoLaunchTime}
          currentHomeName={
            views.find((v) => v.id === homeViewId)?.name ?? null
          }
          onNameChange={setSaveDialogName}
          onSetAsHomeChange={setSaveSetAsHome}
          onAutoLaunchChange={setSaveAutoLaunch}
          onAutoLaunchModeChange={setSaveAutoLaunchMode}
          onAutoLaunchTimeChange={setSaveAutoLaunchTime}
          onCancel={() => setSaveDialogOpen(false)}
          onConfirm={confirmSaveView}
        />
      ) : null}

      {homeReplaceOpen ? (
        <HomeReplaceDialog
          currentHomeName={
            views.find((v) => v.id === homeViewId)?.name ?? 'another view'
          }
          nextHomeName={
            saveDialogOpen
              ? saveDialogName.trim() || 'this view'
              : (activeView?.name ?? 'this view')
          }
          onCancel={() => setHomeReplaceOpen(false)}
          onConfirm={() => {
            if (saveDialogOpen) {
              finishSaveView()
              return
            }
            if (!activeView) return
            setHomeViewId(activeView.id)
            setHomeViewIdState(activeView.id)
            setHomeReplaceOpen(false)
            setToast(`“${activeView.name}” set as home`)
          }}
        />
      ) : null}

      <div className="flex min-h-0 flex-1">
        <div ref={workspaceBodyRef} className="relative min-h-0 flex-1">
          {widgets.length === 0 ? (
            <EmptyCanvas
              hasView={Boolean(activeView)}
              onUseTemplate={() => setViewMenuOpen(true)}
              onAddWidget={() => addWidgetRef.current?.open()}
            />
          ) : maximizedId ? (
            <div className="h-full min-h-0 p-1.5">
              {widgets
                .filter((w) => w.instanceId === maximizedId)
                .map((widget) => (
                  <WidgetFrame
                    key={widget.instanceId}
                    widget={widget}
                    selectedTicker={tickerForWidget(widget)}
                    maximized
                    dragging={false}
                    onSelectTicker={(ticker) =>
                      applyGroupSelection(widget, ticker)
                    }
                    onRemove={() => removeWidget(widget.instanceId)}
                    linkGroups={pageLinkGroups}
                    onSetLinkGroup={(group) =>
                      setWidgetLinkGroup(widget.instanceId, group)
                    }
                    onCreateLinkGroup={() => setLinkModal('create')}
                    onManageLinkGroups={() => setLinkModal('manage')}
                    onConfigReset={() =>
                      setToast('Widget reset to defaults')
                    }
                    onMaximize={() => setMaximizedId(null)}
                    onOpenInScreen={(screen) =>
                      setToast(
                        `Opening “${widget.name}” on screen ${screen}`,
                      )
                    }
                    onConfigChange={(key, value) => {
                      if (key === 'security') {
                        applyGroupSelection(widget, value)
                        return
                      }
                      updateWidgets((list) =>
                        list.map((w) =>
                          w.instanceId === widget.instanceId
                            ? { ...w, config: { ...w.config, [key]: value } }
                            : w,
                        ),
                      )
                    }}
                    onLayoutChange={() => {}}
                    onMoveStart={() => {}}
                    onMoveEnd={() => {}}
                  />
                ))}
            </div>
          ) : (
            <div className="h-full min-h-0 overflow-x-hidden overflow-y-auto bg-bg">
              <div
                className="relative w-full max-w-full overflow-x-hidden"
                style={{ minHeight: contentHeight }}
              >
                {widgets.map((widget) => (
                  <WidgetFrame
                    key={widget.instanceId}
                    widget={widget}
                    selectedTicker={tickerForWidget(widget)}
                    maximized={false}
                    dragging={movingId === widget.instanceId}
                    onSelectTicker={(ticker) =>
                      applyGroupSelection(widget, ticker)
                    }
                    onRemove={() => removeWidget(widget.instanceId)}
                    linkGroups={pageLinkGroups}
                    onSetLinkGroup={(group) =>
                      setWidgetLinkGroup(widget.instanceId, group)
                    }
                    onCreateLinkGroup={() => setLinkModal('create')}
                    onManageLinkGroups={() => setLinkModal('manage')}
                    forceLinkMenuOpen={
                      demo === 'link-menu' &&
                      widget.instanceId ===
                        (widgets.find(
                          (w) => w.id === 'vertical-quote' && !w.floating,
                        )?.instanceId ??
                          widgets.find((w) => !w.floating)?.instanceId)
                    }
                    onConfigReset={() =>
                      setToast('Widget reset to defaults')
                    }
                    onMaximize={() => setMaximizedId(widget.instanceId)}
                    onOpenInScreen={(screen) =>
                      setToast(
                        `Opening “${widget.name}” on screen ${screen}`,
                      )
                    }
                    onConfigChange={(key, value) => {
                      if (key === 'security') {
                        applyGroupSelection(widget, value)
                        return
                      }
                      updateWidgets((list) =>
                        list.map((w) =>
                          w.instanceId === widget.instanceId
                            ? { ...w, config: { ...w.config, [key]: value } }
                            : w,
                        ),
                      )
                    }}
                    onLayoutChange={(layout) =>
                      updateWidgetLayout(widget.instanceId, layout)
                    }
                    onMoveStart={(id) => {
                      setMovingId(id)
                      snapGuideRef.current = null
                      insertTargetRef.current = null
                      setSnapGuide(null)
                      setInsertTarget(null)
                      setAlignGuides([])
                      // Break snap/dock on both sides the moment drag starts
                      updateWidgets((list) => breakDocksInvolving(list, id))
                    }}
                    onMoveEnd={finishMove}
                    onResizeEnd={finishResize}
                  />
                ))}
                {collectiveHandles.map((handle) => (
                  <CollectiveGutterHandleView
                    key={handle.id}
                    handle={handle}
                    widgets={widgets}
                    onResize={applyCollectiveGutterResize}
                  />
                ))}
                {insertTarget ? (
                  <>
                    <div
                      className="pointer-events-none absolute z-30 rounded-[2px] border-2 border-dashed border-[#3b82f6] bg-[rgba(59,130,246,0.12)]"
                      style={{
                        left: insertTarget.inserted.x,
                        top: insertTarget.inserted.y,
                        width: insertTarget.inserted.width,
                        height: insertTarget.inserted.height,
                      }}
                    />
                    {insertTarget.guides.map((guide, i) => (
                      <AlignGuideLine key={`insert-${i}`} guide={guide} />
                    ))}
                  </>
                ) : null}
                {snapGuide
                  ? snapGuide.guides.map((guide, i) => (
                      <AlignGuideLine key={`snap-${i}`} guide={guide} />
                    ))
                  : null}
                {alignGuides.map((guide, i) => (
                  <AlignGuideLine key={`align-${i}`} guide={guide} />
                ))}
              </div>
            </div>
          )}

        </div>

        {showCatchUp ? (
          <CatchUpPanel
            ticker={selectedTicker}
            viewName={activeView?.name ?? draftName}
            pageName={activePage?.name ?? 'Page 1'}
            widgets={widgets.map((w) => ({
              instanceId: w.instanceId,
              id: w.id,
              name: w.name,
            }))}
            onClose={() => {
              setShowCatchUp(false)
              setCatchUpAvailable(false)
            }}
            onContinue={() => {
              setShowCatchUp(false)
              setCatchUpAvailable(false)
            }}
            onOpenWidget={(instanceId) => {
              setMaximizedId(instanceId)
            }}
          />
        ) : null}

        {showComposer ? (
          <ResearchNotesPanel
            ticker={selectedTicker}
            widgetNames={widgets.map((w) => w.name)}
            onClose={() => setShowComposer(false)}
            demoMode={
              demo === 'research-notes'
                ? 'open'
                : demo === 'research-notes-assembled'
                  ? 'assembled'
                  : demo === 'research-notes-sent'
                    ? 'sent'
                    : null
            }
          />
        ) : null}

      </div>

      {toast && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-[2px] border border-border bg-panel px-3 py-1.5 text-[11px] text-text shadow-lg">
          {toast}
        </div>
      )}

      {linkModal === 'create' ? (
        <CreateLinkGroupModal
          widgets={widgets}
          existingGroups={pageLinkGroups}
          onClose={() => setLinkModal(null)}
          onSave={createLinkGroup}
        />
      ) : null}

      {linkModal === 'manage' ? (
        <ManageLinkGroupsModal
          widgets={widgets}
          groups={pageLinkGroups}
          onClose={() => setLinkModal(null)}
          onChangeGroups={updatePageLinkGroups}
          onAssignWidget={setWidgetLinkGroup}
        />
      ) : null}
    </div>
  )
}

const GUIDE_COLORS = {
  edge: { line: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  gutter: { line: '#f24e1e', glow: 'rgba(242, 78, 30, 0.45)' },
} as const

function CollectiveGutterHandleView({
  handle,
  widgets,
  onResize,
}: {
  handle: CollectiveGutterHandle
  widgets: PlacedWidget[]
  onResize: (
    handle: CollectiveGutterHandle,
    delta: number,
    origins: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >,
  ) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{
    startClient: number
    origins: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >
  } | null>(null)

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const delta =
        handle.axis === 'height'
          ? e.clientY - dragRef.current.startClient
          : e.clientX - dragRef.current.startClient
      onResize(handle, delta, dragRef.current.origins)
    }
    const onUp = () => {
      dragRef.current = null
      setDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, handle, onResize])

  const active = hovered || dragging
  const isVerticalBar = handle.axis === 'width'
  const involvedIds = [...handle.primaryIds, ...handle.secondaryIds]

  return (
    <div
      className="absolute z-30"
      style={{
        left: handle.x,
        top: handle.y,
        width: handle.width,
        height: handle.height,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!dragging) setHovered(false)
      }}
      title={
        isVerticalBar
          ? 'Drag to resize width of aligned widgets'
          : 'Drag to resize height of aligned widgets'
      }
    >
      {active ? (
        <button
          type="button"
          aria-label={
            isVerticalBar
              ? 'Collective width resize'
              : 'Collective height resize'
          }
          className={[
            'absolute border border-selection bg-selection/80 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]',
            isVerticalBar
              ? 'left-1/2 top-0 h-full w-1.5 -translate-x-1/2 cursor-ew-resize rounded-[2px]'
              : 'left-0 top-1/2 h-1.5 w-full -translate-y-1/2 cursor-ns-resize rounded-[2px]',
          ].join(' ')}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const origins: Record<
              string,
              { x: number; y: number; width: number; height: number }
            > = {}
            for (const id of involvedIds) {
              const w = widgets.find((item) => item.instanceId === id)
              if (w) {
                origins[id] = {
                  x: w.x,
                  y: w.y,
                  width: w.width,
                  height: w.height,
                }
              }
            }
            setDragging(true)
            setHovered(true)
            dragRef.current = {
              startClient: isVerticalBar ? e.clientX : e.clientY,
              origins,
            }
          }}
        />
      ) : null}
    </div>
  )
}

function AlignGuideLine({ guide }: { guide: AlignGuide }) {
  const horizontal = guide.orientation === 'horizontal'
  const colors = GUIDE_COLORS[guide.kind]
  const thickness = guide.kind === 'gutter' ? 2 : 1
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-40"
      style={
        horizontal
          ? {
              left: guide.x1,
              top: guide.y1 - (thickness - 1) / 2,
              width: Math.max(1, guide.x2 - guide.x1),
              height: thickness,
              background: colors.line,
              boxShadow: `0 0 0 0.5px ${colors.glow}`,
            }
          : {
              left: guide.x1 - (thickness - 1) / 2,
              top: guide.y1,
              width: thickness,
              height: Math.max(1, guide.y2 - guide.y1),
              background: colors.line,
              boxShadow: `0 0 0 0.5px ${colors.glow}`,
            }
      }
    />
  )
}

function templateLabel(id: string) {
  return WORKSPACE_TEMPLATES.find((t) => t.id === id)?.name ?? 'Template'
}

function nextNewViewName(existing: LaunchpadView[]): string {
  const used = new Set(existing.map((v) => v.name))
  let n = 1
  while (used.has(`New View ${n}`)) n += 1
  return `New View ${n}`
}

/** Content fingerprint for dirty detection (ignores x/y/size from canvas fit). */
function viewContentSignature(view: LaunchpadView): string {
  return JSON.stringify(
    view.pages.map((page) => ({
      name: page.name,
      linkGroups: page.linkGroups ?? [],
      widgets: page.widgets.map((w) => ({
        id: w.id,
        instanceId: w.instanceId,
        linkGroup: w.linkGroup,
        config: w.config,
        floating: Boolean(w.floating),
        dock: w.dock ?? null,
      })),
    })),
  )
}

function SaveViewDialog({
  name,
  pageCount,
  widgetCount,
  setAsHome,
  autoLaunch,
  autoLaunchMode,
  autoLaunchTime,
  currentHomeName,
  onNameChange,
  onSetAsHomeChange,
  onAutoLaunchChange,
  onAutoLaunchModeChange,
  onAutoLaunchTimeChange,
  onCancel,
  onConfirm,
}: {
  name: string
  pageCount: number
  widgetCount: number
  setAsHome: boolean
  autoLaunch: boolean
  autoLaunchMode: 'on-arcana' | 'scheduled'
  autoLaunchTime: string
  currentHomeName: string | null
  onNameChange: (name: string) => void
  onSetAsHomeChange: (value: boolean) => void
  onAutoLaunchChange: (value: boolean) => void
  onAutoLaunchModeChange: (value: 'on-arcana' | 'scheduled') => void
  onAutoLaunchTimeChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const pageLabel = `${pageCount} ${pageCount === 1 ? 'page' : 'pages'}`
  const widgetLabel = `${widgetCount} ${widgetCount === 1 ? 'widget' : 'widgets'}`

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dismiss"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-view-title"
        className="relative z-[81] w-[400px] rounded-[2px] border border-border bg-panel shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2
            id="save-view-title"
            className="text-[13px] font-semibold text-text"
          >
            Save View
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-6 w-6 items-center justify-center text-text-muted hover:text-text"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3 px-3 py-3">
          <div className="flex items-stretch overflow-hidden rounded-[2px] border border-selection/35 bg-selection-muted">
            <div className="w-0.5 shrink-0 bg-selection" aria-hidden />
            <div className="min-w-0 flex-1 px-3 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-selection">
                Summary
              </div>
              <div className="mt-0.5 text-[12px] text-text">
                {pageLabel}, {widgetLabel}
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-text-secondary">
              View name
            </span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirm()
                if (e.key === 'Escape') onCancel()
              }}
              className="h-8 w-full rounded-[2px] border border-border bg-bg px-2 text-[12px] text-text outline-none focus:border-selection"
              placeholder="New View 1"
            />
          </label>

          <div className="space-y-2 border-t border-border pt-3">
            <label className="flex cursor-pointer items-start gap-2 text-[12px] text-text-secondary hover:text-text">
              <input
                type="checkbox"
                checked={setAsHome}
                onChange={(e) => onSetAsHomeChange(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-selection)]"
              />
              <span>
                <span className="block text-text">Set as home view</span>
                {setAsHome && currentHomeName ? (
                  <span className="mt-0.5 block text-[11px] text-text-muted">
                    Replaces “{currentHomeName}” as home
                  </span>
                ) : (
                  <span className="mt-0.5 block text-[11px] text-text-muted">
                    Opens when you click Launchpad
                  </span>
                )}
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2 text-[12px] text-text-secondary hover:text-text">
              <input
                type="checkbox"
                checked={autoLaunch}
                onChange={(e) => onAutoLaunchChange(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-selection)]"
              />
              <span>
                <span className="block text-text">Launch automatically</span>
                <span className="mt-0.5 block text-[11px] text-text-muted">
                  Open this home view without opening Launchpad manually
                </span>
              </span>
            </label>

            {autoLaunch ? (
              <fieldset className="ml-5 space-y-2 border-0 p-0">
                <legend className="absolute -m-px h-px w-px overflow-hidden border-0 p-0 whitespace-nowrap">
                  Auto-launch timing
                </legend>
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-text-secondary hover:text-text">
                  <input
                    type="radio"
                    name="save-auto-launch-mode"
                    checked={autoLaunchMode === 'on-arcana'}
                    onChange={() => onAutoLaunchModeChange('on-arcana')}
                    className="h-3.5 w-3.5 accent-[var(--color-selection)]"
                  />
                  When I launch Arcana
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-text-secondary hover:text-text">
                  <input
                    type="radio"
                    name="save-auto-launch-mode"
                    checked={autoLaunchMode === 'scheduled'}
                    onChange={() => onAutoLaunchModeChange('scheduled')}
                    className="h-3.5 w-3.5 accent-[var(--color-selection)]"
                  />
                  At a scheduled time
                </label>
                {autoLaunchMode === 'scheduled' ? (
                  <label className="ml-5 flex items-center gap-2 text-[11px] text-text-muted">
                    Time
                    <input
                      type="time"
                      value={autoLaunchTime}
                      onChange={(e) => onAutoLaunchTimeChange(e.target.value)}
                      className="h-7 rounded-[2px] border border-border bg-bg px-2 text-[12px] text-text outline-none focus:border-selection"
                    />
                  </label>
                ) : null}
              </fieldset>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-7 items-center rounded-[2px] border border-border px-2.5 text-[11px] text-text-secondary hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!name.trim()}
            className="inline-flex h-7 items-center gap-1 rounded-[2px] bg-selection px-2.5 text-[11px] font-medium text-white enabled:hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={11} />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewNameField({
  value,
  placeholder,
  editing,
  inputRef,
  onEditingChange,
  onChange,
  onCommit,
}: {
  value: string
  placeholder: string
  editing: boolean
  inputRef: RefObject<HTMLInputElement | null>
  onEditingChange: (editing: boolean) => void
  onChange: (value: string) => void
  onCommit: () => void
}) {
  return (
    <div
      className={[
        'flex h-6 w-44 items-center gap-1 rounded-[2px] border bg-panel px-2',
        editing ? 'border-selection' : 'border-border',
      ].join(' ')}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onEditingChange(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit()
            if (e.key === 'Escape') onEditingChange(false)
          }}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] font-normal text-text placeholder:text-text-muted outline-none"
          aria-label="View name"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            onEditingChange(true)
            queueMicrotask(() => inputRef.current?.focus())
          }}
          className={[
            'h-full min-w-0 flex-1 truncate text-left text-[12px] font-normal',
            value.trim() ? 'text-text' : 'text-text-muted',
          ].join(' ')}
          title="Edit view name"
        >
          {value.trim() || placeholder}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          onEditingChange(true)
          queueMicrotask(() => inputRef.current?.focus())
        }}
        className="shrink-0 text-text-muted hover:text-text"
        aria-label="Edit view name"
        title="Edit view name"
      >
        <Pencil size={11} />
      </button>
    </div>
  )
}

function EmptyCanvas({
  hasView,
  onUseTemplate,
  onAddWidget,
}: {
  hasView: boolean
  onUseTemplate: () => void
  onAddWidget: () => void
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="max-w-md px-4 text-center">
        <p className="mb-1 text-[13px] font-semibold">
          {hasView ? 'Empty page' : 'Build your workspace'}
        </p>
        <p className="mb-3 text-[12px] text-text-secondary">
          Start from a template, or add widgets by name or shortform (QM, DES,
          NEWS, GP, FA, RV).
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onUseTemplate}
            className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-border px-2.5 text-[11px] text-text-secondary hover:border-selection hover:text-text"
          >
            <LayoutTemplate size={12} />
            Open from templates
          </button>
          <button
            type="button"
            onClick={onAddWidget}
            className="inline-flex h-7 items-center gap-1 rounded-[2px] bg-[#e8873a] px-2.5 text-[11px] font-medium text-black hover:bg-[#f0954a]"
          >
            <Plus size={12} />
            Add widget(s)
          </button>
        </div>
      </div>
    </div>
  )
}

function PageTabs({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  canEdit,
}: {
  pages: { id: string; name: string }[]
  activePageId: string
  onSelectPage: (id: string) => void
  onAddPage: () => void
  canEdit: boolean
}) {
  return (
    <div className="page-tabs flex min-w-0 flex-1 items-end gap-0.5 self-end pl-2 pr-1">
      {pages.map((page) => {
        const isActive = page.id === activePageId
        return (
          <div
            key={page.id}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            onClick={() => canEdit && onSelectPage(page.id)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && canEdit) {
                e.preventDefault()
                onSelectPage(page.id)
              }
            }}
            className={[
              'page-tab group inline-flex h-[26px] max-w-[140px] cursor-pointer items-center px-2.5 text-[11px]',
              isActive ? 'page-tab--active' : 'page-tab--idle',
            ].join(' ')}
          >
            <span className="truncate">{page.name}</span>
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => canEdit && onAddPage()}
        className="mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-[2px] text-text-muted hover:bg-panel hover:text-text disabled:opacity-40"
        aria-label="Add page"
        disabled={!canEdit}
      >
        <Plus size={12} strokeWidth={2} />
      </button>
    </div>
  )
}

function HomeReplaceDialog({
  currentHomeName,
  nextHomeName,
  onCancel,
  onConfirm,
}: {
  currentHomeName: string
  nextHomeName: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dismiss"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-replace-title"
        className="relative z-[81] w-[380px] rounded-[2px] border border-border bg-panel shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2
            id="home-replace-title"
            className="text-[13px] font-semibold text-text"
          >
            Replace home view?
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-6 w-6 items-center justify-center text-text-muted hover:text-text"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        <div className="space-y-2 px-3 py-3 text-[12px] text-text-secondary">
          <p>
            Only one view can be home. Home is what opens when you click
            Launchpad or when Arcana starts.
          </p>
          <p>
            <span className="font-medium text-text">{currentHomeName}</span> is
            currently home. Set{' '}
            <span className="font-medium text-text">{nextHomeName}</span> as home
            instead?
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-7 items-center rounded-[2px] border border-border px-2.5 text-[11px] text-text-secondary hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-7 items-center rounded-[2px] bg-selection px-2.5 text-[11px] font-medium text-white hover:bg-[#2563eb]"
          >
            Set as home
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewsDropdown({
  views,
  activeViewId,
  homeViewId,
  activeTemplateId,
  open,
  onOpenChange,
  onSelectView,
  onSelectTemplate,
  onOpenViewInScreen,
}: {
  views: LaunchpadView[]
  activeViewId: string | null
  homeViewId: string
  activeTemplateId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectView: (id: string) => void
  onSelectTemplate: (id: string) => void
  onOpenViewInScreen: (viewId: string, screen: 1 | 2) => void
}) {
  const [contextMenu, setContextMenu] = useState<{
    viewId: string
    viewName: string
    x: number
    y: number
  } | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const active = views.find((v) => v.id === activeViewId)
  const label = active?.name ?? 'Select a view'
  const activeIsHome = Boolean(active && active.id === homeViewId)

  useEffect(() => {
    if (!contextMenu) return
    function onPointerDown(e: PointerEvent) {
      if (contextMenuRef.current?.contains(e.target as Node)) return
      setContextMenu(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setContextMenu(null)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [contextMenu])

  function closeAll() {
    setContextMenu(null)
    onOpenChange(false)
  }

  return (
    <div className="relative flex items-center">
      <div className="inline-flex h-6 max-w-[220px] items-center rounded-[2px] border border-border">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="inline-flex h-full min-w-0 items-center gap-1 px-2 text-[11px] text-text-secondary hover:text-text"
        >
          <span className="truncate">{label}</span>
          {activeIsHome ? (
            <Home size={11} className="shrink-0 text-selection" />
          ) : null}
          <ChevronDown size={11} className="shrink-0 opacity-70" />
        </button>
      </div>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close views"
            onClick={closeAll}
          />
          <div className="absolute left-0 top-full z-50 mt-0.5 w-72 rounded-[2px] border border-border bg-panel py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              My views
            </div>
            {views.length === 0 ? (
              <div className="px-2.5 py-2 text-[11px] text-text-muted">
                No saved views yet
              </div>
            ) : (
              views.map((view) => {
                const isHome = view.id === homeViewId
                const isActive = view.id === activeViewId
                return (
                  <button
                    key={view.id}
                    type="button"
                    onClick={() => {
                      onSelectView(view.id)
                      closeAll()
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setContextMenu({
                        viewId: view.id,
                        viewName: view.name,
                        x: e.clientX,
                        y: e.clientY,
                      })
                    }}
                    className={[
                      'flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[11px]',
                      isActive
                        ? 'bg-selection text-white'
                        : 'text-text-secondary hover:bg-white/[0.04] hover:text-text',
                    ].join(' ')}
                  >
                    <span className="min-w-0 flex-1 truncate">{view.name}</span>
                    {isHome ? (
                      <Home
                        size={11}
                        className={
                          isActive ? 'shrink-0 text-white' : 'shrink-0 text-selection'
                        }
                      />
                    ) : null}
                  </button>
                )
              })
            )}

            <div className="my-1 border-t border-border" />
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              Templates
            </div>
            {WORKSPACE_TEMPLATES.map((t) => {
              const selected = t.id === activeTemplateId && !active
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    onSelectTemplate(t.id)
                    closeAll()
                  }}
                  className={[
                    'flex w-full flex-col px-2.5 py-1.5 text-left',
                    selected
                      ? 'bg-[#e8873a]/20'
                      : 'hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <span className="text-[12px] text-text">{t.name}</span>
                  <span className="text-[11px] text-text-muted">
                    {t.description}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {contextMenu ? (
        <div
          ref={contextMenuRef}
          role="menu"
          aria-label={`Open ${contextMenu.viewName}`}
          className="fixed z-[60] min-w-[168px] rounded-[2px] border border-border bg-panel py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-text-secondary hover:bg-white/[0.04] hover:text-text"
            onClick={() => {
              onOpenViewInScreen(contextMenu.viewId, 1)
              closeAll()
            }}
          >
            <Monitor size={12} className="shrink-0" />
            Open in screen 1
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px] text-text-secondary hover:bg-white/[0.04] hover:text-text"
            onClick={() => {
              onOpenViewInScreen(contextMenu.viewId, 2)
              closeAll()
            }}
          >
            <Monitor size={12} className="shrink-0" />
            Open in screen 2
          </button>
        </div>
      ) : null}
    </div>
  )
}
