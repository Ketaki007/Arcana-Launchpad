import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { FactorTableWidget } from '../components/FactorTableWidget'
import { factorTables } from '../data/mockFactors'

export function FactorDashboardsPage() {
  const [activeSidebar, setActiveSidebar] = useState('Live Factor Movers')
  const [selectedTableId, setSelectedTableId] = useState(factorTables[0].id)

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar activeItem={activeSidebar} onSelect={setActiveSidebar} />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[16px] font-semibold text-text">
              {activeSidebar}
            </h1>
            <button
              type="button"
              className="text-text-muted hover:text-text"
              aria-label="Rename playground"
            >
              <Pencil size={12} strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-border px-2 text-[12px] text-text-secondary hover:text-text"
            >
              <Plus size={12} strokeWidth={2} />
              Create Table
            </button>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-[2px] border border-border px-2 text-[12px] text-text-secondary hover:text-text"
            >
              <Plus size={12} strokeWidth={2} />
              Create Chart
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-1.5">
          {factorTables.map((table) => (
            <FactorTableWidget
              key={table.id}
              table={table}
              selected={selectedTableId === table.id}
              onSelect={() => setSelectedTableId(table.id)}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
