import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { GripVertical, Link2Off, Pencil, Trash2, X } from 'lucide-react'
import {
  LINK_GROUP_COLORS,
  nextLinkGroupColor,
  shortLabelFromName,
  type LinkGroupDef,
  type PlacedWidget,
  type WidgetLinkGroup,
} from '../../data/launchpadModel'

type CreateProps = {
  widgets: PlacedWidget[]
  existingGroups: LinkGroupDef[]
  onClose: () => void
  onSave: (group: LinkGroupDef, memberIds: string[]) => void
}

export function CreateLinkGroupModal({
  widgets,
  existingGroups,
  onClose,
  onSave,
}: CreateProps) {
  const [name, setName] = useState(
    `Group ${String.fromCharCode(65 + existingGroups.length)}`,
  )
  const [color, setColor] = useState(nextLinkGroupColor(existingGroups))
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const shortLabel = shortLabelFromName(name.trim() || 'G')

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <ModalShell title="Create new group" onClose={onClose} width="w-[420px]">
      <div className="space-y-3 px-3 py-3">
        <div>
          <div className="mb-1 text-[11px] text-text-secondary">
            Group name & colour
          </div>
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <button
                type="button"
                title="Change colour"
                onClick={() => setColorPickerOpen((v) => !v)}
                className="inline-flex h-7 items-center gap-0.5 rounded-[2px] px-1.5 text-[10px] font-bold text-white ring-1 ring-white/20 hover:ring-white/50"
                style={{ backgroundColor: color }}
              >
                <span>{shortLabel}</span>
                <Pencil size={9} className="opacity-90" aria-hidden />
              </button>
              {colorPickerOpen ? (
                <ChipColorPicker
                  value={color}
                  onChange={(c) => {
                    setColor(c)
                    setColorPickerOpen(false)
                  }}
                  onClose={() => setColorPickerOpen(false)}
                />
              ) : null}
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 min-w-0 flex-1 rounded-[2px] border border-border bg-bg px-2 text-[12px] text-text outline-none focus:border-selection"
            />
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-[2px] border border-border-subtle">
            <div className="flex items-center gap-2 border-b border-border-subtle px-2.5 py-1.5">
              <span className="w-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 text-[11px] text-text-secondary">
                Select widgets to link to this group
              </span>
              <span className="w-[7.5rem] shrink-0 text-right text-[11px] text-text-secondary">
                Currently linked to
              </span>
            </div>
            <ul className="max-h-52 space-y-0.5 overflow-auto">
              {widgets.length === 0 ? (
                <li className="px-2.5 py-3 text-[11px] text-text-muted">
                  No widgets on this page
                </li>
              ) : (
                widgets.map((w) => {
                  const checked = selected.has(w.instanceId)
                  const current = existingGroups.find(
                    (g) => g.id === w.linkGroup,
                  )
                  return (
                    <li key={w.instanceId}>
                      <label className="flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-[11px] hover:bg-white/[0.04]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(w.instanceId)}
                          className="accent-[#60a5fa]"
                        />
                        <span className="min-w-0 flex-1 truncate text-text">
                          {w.name}
                          <span className="ml-1.5 font-mono text-[10px] text-text-muted">
                            {widgetSignifier(w)}
                          </span>
                        </span>
                        <span className="flex w-[7.5rem] shrink-0 justify-end">
                          {current ? (
                            <span
                              className="rounded-[2px] px-1 text-[9px] font-bold text-white"
                              style={{ backgroundColor: current.color }}
                              title={current.name}
                            >
                              {current.shortLabel}
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted">
                              None
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
          <p className="mt-1.5 text-[10px] text-text-muted">
            {selected.size} selected. Use Manage groups to drag widgets between
            groups or unlink them.
          </p>
        </div>
      </div>

      <footer className="flex justify-end gap-2 border-t border-border px-3 py-2">
        <button
          type="button"
          onClick={onClose}
          className="h-7 rounded-[2px] px-2.5 text-[11px] text-text-secondary hover:text-text"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            const group: LinkGroupDef = {
              id: `lg-${Date.now().toString(36)}`,
              name: name.trim(),
              shortLabel,
              color,
            }
            onSave(group, [...selected])
          }}
          className="h-7 rounded-[2px] bg-selection px-3 text-[11px] font-medium text-white disabled:opacity-40"
        >
          Save
        </button>
      </footer>
    </ModalShell>
  )
}

type ManageProps = {
  widgets: PlacedWidget[]
  groups: LinkGroupDef[]
  onClose: () => void
  onChangeGroups: (groups: LinkGroupDef[]) => void
  onAssignWidget: (instanceId: string, groupId: WidgetLinkGroup) => void
}

export function ManageLinkGroupsModal({
  widgets,
  groups,
  onClose,
  onChangeGroups,
  onAssignWidget,
}: ManageProps) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | 'none' | null>(null)
  const [colorPickerFor, setColorPickerFor] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const byGroup = useMemo(() => {
    const map = new Map<string | null, PlacedWidget[]>()
    map.set(null, [])
    for (const g of groups) map.set(g.id, [])
    for (const w of widgets) {
      const key =
        w.linkGroup && map.has(w.linkGroup) ? w.linkGroup : null
      map.get(key)!.push(w)
    }
    return map
  }, [widgets, groups])

  function updateGroup(id: string, patch: Partial<LinkGroupDef>) {
    onChangeGroups(
      groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    )
  }

  function removeGroup(id: string) {
    for (const w of widgets) {
      if (w.linkGroup === id) onAssignWidget(w.instanceId, null)
    }
    onChangeGroups(groups.filter((g) => g.id !== id))
  }

  function onDrop(target: string | null) {
    if (!dragId) return
    onAssignWidget(dragId, target)
    setDragId(null)
    setDropTarget(null)
  }

  return (
    <ModalShell
      title="Manage groups and linkages"
      onClose={onClose}
      width="w-[480px]"
    >
      <div className="max-h-[60vh] space-y-3 overflow-auto px-3 py-3">
        {groups.length === 0 ? (
          <div className="text-[11px] text-text-muted">
            No groups yet. Create one from the link menu.
          </div>
        ) : (
          groups.map((group) => {
            const members = byGroup.get(group.id) ?? []
            const isDrop = dropTarget === group.id
            return (
              <section
                key={group.id}
                className={[
                  'rounded-[2px] border border-border-subtle p-2.5',
                  isDrop ? 'border-selection bg-selection/5' : '',
                ].join(' ')}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDropTarget(group.id)
                }}
                onDragLeave={() =>
                  setDropTarget((t) => (t === group.id ? null : t))
                }
                onDrop={(e) => {
                  e.preventDefault()
                  onDrop(group.id)
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      title="Change colour"
                      onClick={() =>
                        setColorPickerFor((id) =>
                          id === group.id ? null : group.id,
                        )
                      }
                      className="inline-flex h-6 items-center gap-0.5 rounded-[2px] px-1.5 text-[10px] font-bold text-white ring-1 ring-white/20 hover:ring-white/50"
                      style={{ backgroundColor: group.color }}
                    >
                      <span>{group.shortLabel}</span>
                      <Pencil size={9} className="opacity-90" aria-hidden />
                    </button>
                    {colorPickerFor === group.id ? (
                      <ChipColorPicker
                        value={group.color}
                        onChange={(c) => {
                          updateGroup(group.id, { color: c })
                          setColorPickerFor(null)
                        }}
                        onClose={() => setColorPickerFor(null)}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 truncate text-[12px] font-medium text-text">
                    {group.name}
                  </div>
                  {confirmDeleteId === group.id ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          removeGroup(group.id)
                          setConfirmDeleteId(null)
                        }}
                        className="h-6 rounded-[2px] bg-negative/20 px-1.5 text-[10px] font-medium text-negative hover:bg-negative/30"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-6 rounded-[2px] px-1.5 text-[10px] text-text-muted hover:text-text"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete"
                      onClick={() => setConfirmDeleteId(group.id)}
                      className="shrink-0 rounded-[2px] p-1 text-text-muted hover:bg-white/[0.06] hover:text-negative"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <ul className="min-h-[28px] space-y-0.5">
                  {members.length === 0 ? (
                    <li className="px-1 py-1 text-[10px] text-text-muted">
                      Drop widgets here
                    </li>
                  ) : (
                    members.map((w) => (
                      <DraggableWidgetRow
                        key={w.instanceId}
                        widget={w}
                        accent={group.color}
                        onDragStart={() => setDragId(w.instanceId)}
                        onDragEnd={() => {
                          setDragId(null)
                          setDropTarget(null)
                        }}
                        onUnlink={() => onAssignWidget(w.instanceId, null)}
                      />
                    ))
                  )}
                </ul>
              </section>
            )
          })
        )}

        <section
          className={[
            'rounded-[2px] border border-dashed border-border-subtle p-2.5',
            dropTarget === 'none' ? 'border-selection bg-selection/5' : '',
          ].join(' ')}
          onDragOver={(e) => {
            e.preventDefault()
            setDropTarget('none')
          }}
          onDragLeave={() =>
            setDropTarget((t) => (t === 'none' ? null : t))
          }
          onDrop={(e) => {
            e.preventDefault()
            onDrop(null)
          }}
        >
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-text-secondary">
            <Link2Off size={12} />
            Unlinked (None)
          </div>
          <ul className="min-h-[28px] space-y-0.5">
            {(byGroup.get(null) ?? []).map((w) => (
              <DraggableWidgetRow
                key={w.instanceId}
                widget={w}
                onDragStart={() => setDragId(w.instanceId)}
                onDragEnd={() => {
                  setDragId(null)
                  setDropTarget(null)
                }}
              />
            ))}
            {(byGroup.get(null) ?? []).length === 0 ? (
              <li className="px-1 py-1 text-[10px] text-text-muted">
                Drop here to unlink
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <footer className="flex justify-end border-t border-border px-3 py-2">
        <button
          type="button"
          onClick={onClose}
          className="h-7 rounded-[2px] bg-selection px-3 text-[11px] font-medium text-white"
        >
          Done
        </button>
      </footer>
    </ModalShell>
  )
}

/** Distinguishes duplicate widget types (e.g. two Vertical Quotes on different securities). */
function widgetSignifier(widget: PlacedWidget): string {
  const security = widget.config.security?.trim()
  if (security) return security
  const filter = widget.config.filter?.trim()
  if (filter && filter !== 'All') return filter
  const timeframe = widget.config.timeframe?.trim()
  if (timeframe) return timeframe
  const period = widget.config.period?.trim()
  if (period) return period
  if (widget.shortform) return widget.shortform
  const tail = widget.instanceId.split('-').pop() ?? ''
  return tail.slice(0, 4).toUpperCase() || widget.id
}

function DraggableWidgetRow({
  widget,
  accent,
  onDragStart,
  onDragEnd,
  onUnlink,
}: {
  widget: PlacedWidget
  accent?: string
  onDragStart: () => void
  onDragEnd: () => void
  onUnlink?: () => void
}) {
  const signifier = widgetSignifier(widget)
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', widget.instanceId)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      className="flex cursor-grab items-center gap-1.5 rounded-[2px] bg-white/[0.03] px-1.5 py-1 text-[11px] active:cursor-grabbing"
    >
      <GripVertical size={11} className="shrink-0 text-text-muted" />
      {accent ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-text">
        {widget.name}
        <span className="ml-1.5 font-mono text-[10px] text-text-muted">
          {signifier}
        </span>
      </span>
      {onUnlink ? (
        <button
          type="button"
          title="Unlink"
          aria-label="Unlink"
          onClick={onUnlink}
          className="shrink-0 rounded-[2px] p-0.5 text-text-muted hover:bg-white/[0.06] hover:text-text"
        >
          <Link2Off size={11} />
        </button>
      ) : null}
    </li>
  )
}

function ChipColorPicker({
  value,
  onChange,
  onClose,
}: {
  value: string
  onChange: (color: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-20 mt-1 w-[108px] rounded-[2px] border border-border bg-panel p-2 shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
    >
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        Colour
      </div>
      <ColorSwatches value={value} onChange={onChange} />
    </div>
  )
}

function ColorSwatches({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="grid w-[90px] grid-cols-3 gap-1.5">
      {LINK_GROUP_COLORS.map((c) => {
        const active = c === value
        return (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(c)}
            className={[
              'box-border size-7 shrink-0 rounded-[2px] border-2',
              active ? 'border-white' : 'border-transparent hover:border-white/40',
            ].join(' ')}
            style={{ backgroundColor: c }}
          />
        )
      })}
    </div>
  )
}

function ModalShell({
  title,
  onClose,
  width,
  children,
}: {
  title: string
  onClose: () => void
  width: string
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={`relative ${width} max-w-full overflow-hidden rounded-[2px] border border-selection bg-panel shadow-[0_16px_48px_rgba(0,0,0,0.55)]`}
      >
        <header className="flex h-8 items-center border-b border-border px-3">
          <div className="flex-1 text-[12px] font-semibold">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}
