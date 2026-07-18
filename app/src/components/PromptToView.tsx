import { useEffect, useId, useRef, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import {
  PROMPT_TO_VIEW_EXAMPLES,
  interpretPromptToView,
  type PromptToViewResult,
} from '../lib/promptToView'

type PromptToViewProps = {
  onGenerate: (result: PromptToViewResult, prompt: string) => void
}

export function PromptToView({ onGenerate }: PromptToViewProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open) {
      // Focus after open so the panel is in the DOM
      const t = window.setTimeout(() => textareaRef.current?.focus(), 0)
      return () => window.clearTimeout(t)
    }
  }, [open])

  function toggle() {
    setOpen((v) => !v)
  }

  function generate() {
    const trimmed = prompt.trim()
    if (!trimmed || loading) return
    setLoading(true)
    // Brief delay so the “assembling” state is perceptible in the demo
    window.setTimeout(() => {
      const result = interpretPromptToView(trimmed)
      onGenerate(result, trimmed)
      setLoading(false)
      setOpen(false)
      setPrompt('')
    }, 450)
  }

  return (
    <div ref={rootRef} className="relative flex items-center">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Prompt to view"
        title="Prompt to view — describe what you want to analyze"
        onClick={toggle}
        className={[
          'inline-flex h-6 w-6 items-center justify-center rounded-[2px] transition-colors',
          open
            ? 'bg-selection text-white'
            : 'text-text-secondary hover:bg-white/[0.06] hover:text-text',
        ].join(' ')}
      >
        <Sparkles size={13} strokeWidth={1.75} />
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Prompt to view"
          className="absolute right-0 top-full z-50 mt-0.5 w-[360px] rounded-[2px] border border-border bg-panel p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles size={12} className="shrink-0 text-selection" />
            <span className="text-[11px] font-medium text-text">
              Prompt to view
            </span>
          </div>
          <p className="mb-2 text-[10px] leading-relaxed text-text-muted">
            Describe your intent. Launchpad will assemble a starting set of
            widgets you can edit.
          </p>

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Compare NVDA and AMD after earnings…"
            rows={3}
            className="w-full resize-none rounded-[2px] border border-border bg-bg px-2 py-1.5 text-[11px] leading-relaxed text-text outline-none placeholder:text-text-muted focus:border-selection"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                generate()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
              }
            }}
          />

          <div className="mt-1.5 flex flex-wrap gap-1">
            {PROMPT_TO_VIEW_EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setPrompt(example)
                  textareaRef.current?.focus()
                }}
                className="rounded-[2px] border border-border-subtle px-1.5 py-0.5 text-[10px] text-text-muted hover:border-border hover:text-text-secondary"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-6 items-center rounded-[2px] px-2 text-[11px] text-text-secondary hover:text-text"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!prompt.trim() || loading}
              onClick={generate}
              className="inline-flex h-6 items-center gap-1.5 rounded-[2px] bg-selection px-2.5 text-[11px] font-medium text-white enabled:hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Assembling…
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
