import type { DragEvent as ReactDragEvent } from 'react'

/** Drag payload for dropping workspace content into Research Notes. */

export const RESEARCH_DND_MIME = 'application/x-arcana-research'

export type ResearchEvidenceKind = 'widget' | 'security' | 'news' | 'metric'

export type ResearchEvidenceItem = {
  id: string
  kind: ResearchEvidenceKind
  title: string
  detail?: string
  source?: string
  /** Assembled AI suggestion vs user-dropped pin */
  origin: 'assembled' | 'dropped'
}

export type ResearchDropPayload = {
  kind: ResearchEvidenceKind
  title: string
  detail?: string
  source?: string
}

export function setResearchDragData(
  e: ReactDragEvent,
  payload: ResearchDropPayload,
) {
  e.dataTransfer.setData(RESEARCH_DND_MIME, JSON.stringify(payload))
  e.dataTransfer.setData('text/plain', payload.title)
  e.dataTransfer.effectAllowed = 'copy'
}

export function readResearchDragData(
  e: ReactDragEvent,
): ResearchDropPayload | null {
  const raw = e.dataTransfer.getData(RESEARCH_DND_MIME)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ResearchDropPayload
  } catch {
    return null
  }
}

export function evidenceFromDrop(
  payload: ResearchDropPayload,
): ResearchEvidenceItem {
  return {
    id: `drop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: payload.kind,
    title: payload.title,
    detail: payload.detail,
    source: payload.source,
    origin: 'dropped',
  }
}
