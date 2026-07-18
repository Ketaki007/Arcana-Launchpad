import { WORKSPACE_TEMPLATES } from '../data/launchpadModel'
import { LAUNCHPAD_WIDGETS } from '../data/widgets'

export type PromptToViewResult = {
  widgetIds: string[]
  /** Primary securities inferred from the prompt, if any. */
  tickers: string[]
  /** Suggested view name based on intent. */
  suggestedName: string
  /** Short explanation of what was assembled. */
  rationale: string
}

const KNOWN_TICKERS = [
  'NVDA',
  'AMD',
  'INTC',
  'TSLA',
  'AAPL',
  'MSFT',
  'META',
  'GOOGL',
  'AMZN',
  'AVGO',
] as const

/** Intent patterns → template id (order matters — first match wins). */
const INTENT_RULES: { pattern: RegExp; templateId: string; name: string }[] = [
  {
    pattern:
      /\b(peer|compar|vs\.?|versus|competitor|relative\s+val)/i,
    templateId: 'peer-comparison',
    name: 'Peer Comparison',
  },
  {
    pattern:
      /\b(earning|eps|quarterly|results\s+call|before\s+.*\s+call)/i,
    templateId: 'earnings-review',
    name: 'Earnings Review',
  },
  {
    pattern:
      /\b(monitor|watch|tape|live\s+quote|market\s+overview|banking|sector|interest\s+rate)/i,
    templateId: 'market-monitoring',
    name: 'Market Monitoring',
  },
  {
    pattern:
      /\b(research|investigate|fundament|overview|company|descrip)/i,
    templateId: 'company-research',
    name: 'Company Research',
  },
]

const DEFAULT_TEMPLATE_ID = 'company-research'

function extractTickers(prompt: string): string[] {
  const upper = prompt.toUpperCase()
  const found: string[] = []
  for (const t of KNOWN_TICKERS) {
    // Word-boundary style match for tickers
    const re = new RegExp(`\\b${t}\\b`, 'i')
    if (re.test(upper) && !found.includes(t)) found.push(t)
  }
  // Also catch lowercase company names mapped lightly
  const aliases: Record<string, string> = {
    nvidia: 'NVDA',
    intel: 'INTC',
    tesla: 'TSLA',
    apple: 'AAPL',
    microsoft: 'MSFT',
    amazon: 'AMZN',
    google: 'GOOGL',
    meta: 'META',
  }
  const lower = prompt.toLowerCase()
  for (const [alias, ticker] of Object.entries(aliases)) {
    if (lower.includes(alias) && !found.includes(ticker)) found.push(ticker)
  }
  return found
}

function resolveTemplate(prompt: string): {
  templateId: string
  name: string
} {
  for (const rule of INTENT_RULES) {
    if (rule.pattern.test(prompt)) {
      return { templateId: rule.templateId, name: rule.name }
    }
  }
  return {
    templateId: DEFAULT_TEMPLATE_ID,
    name: 'Company Research',
  }
}

/**
 * Interpret a natural-language intent into a sensible first-draft widget set.
 * Heuristic only — mirrors Prompt to Workspace as an assistant, not an analyst.
 */
export function interpretPromptToView(prompt: string): PromptToViewResult {
  const trimmed = prompt.trim()
  const tickers = extractTickers(trimmed)
  const { templateId, name } = resolveTemplate(trimmed)
  const template =
    WORKSPACE_TEMPLATES.find((t) => t.id === templateId) ??
    WORKSPACE_TEMPLATES[0]!

  const widgetIds = template.widgetIds.filter((id) =>
    LAUNCHPAD_WIDGETS.some((w) => w.id === id),
  )

  const tickerLabel =
    tickers.length > 0
      ? tickers.slice(0, 3).join(' · ')
      : null

  const suggestedName = tickerLabel
    ? `${name} — ${tickerLabel}`
    : name

  const widgetNames = widgetIds
    .map((id) => LAUNCHPAD_WIDGETS.find((w) => w.id === id)?.name)
    .filter(Boolean)
    .join(', ')

  const rationale = tickerLabel
    ? `Assembled ${name.toLowerCase()} widgets for ${tickerLabel}: ${widgetNames}.`
    : `Assembled ${name.toLowerCase()} widgets: ${widgetNames}.`

  return {
    widgetIds,
    tickers,
    suggestedName,
    rationale,
  }
}

export const PROMPT_TO_VIEW_EXAMPLES = [
  'Compare NVDA, AMD and INTC after earnings',
  'Investigate TSLA before tomorrow’s earnings call',
  'Monitor banking stocks and rates news',
] as const
