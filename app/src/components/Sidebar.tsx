import { Plus } from 'lucide-react'
import { sidebarItems } from '../data/mockFactors'

type SidebarProps = {
  activeItem: string
  onSelect: (item: string) => void
}

export function Sidebar({ activeItem, onSelect }: SidebarProps) {
  return (
    <aside className="flex w-[168px] shrink-0 flex-col border-r border-border bg-bg-elevated">
      <nav className="flex-1 overflow-y-auto py-1">
        {sidebarItems.map((item) => {
          const isActive = item === activeItem
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={[
                'relative flex w-full items-center px-3 py-[6px] text-left text-[12px] transition-colors',
                isActive
                  ? 'bg-selection-muted text-text'
                  : 'text-text-secondary hover:bg-panel hover:text-text',
              ].join(' ')}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-selection" />
              )}
              {item}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-[2px] border border-border text-[12px] text-text-secondary hover:border-text-muted hover:text-text"
        >
          <Plus size={12} strokeWidth={2} />
          New Playground
        </button>
      </div>
    </aside>
  )
}
