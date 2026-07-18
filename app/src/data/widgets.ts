export type WidgetDefinition = {
  id: string
  name: string
  shortform?: string
  keywords: string[]
}

/** Widgets available to add in Launchpad v0 */
export const LAUNCHPAD_WIDGETS: WidgetDefinition[] = [
  {
    id: 'watchlist',
    name: 'Launchpad Watchlist',
    shortform: 'WL',
    keywords: ['watchlist', 'watch', 'list', 'securities', 'monitor'],
  },
  {
    id: 'quote-monitor',
    name: 'Quote Monitor',
    shortform: 'QM',
    keywords: ['quote', 'monitor', 'quotes', 'price'],
  },
  {
    id: 'vertical-quote',
    name: 'Vertical Quote',
    shortform: 'VQ',
    keywords: ['vertical', 'quote', 'vert', 'price', 'bid', 'ask', 'security'],
  },
  {
    id: 'description',
    name: 'Description',
    shortform: 'DES',
    keywords: ['description', 'company', 'overview', 'profile'],
  },
  {
    id: 'news',
    name: 'News',
    shortform: 'NEWS',
    keywords: ['news', 'headlines', 'articles', 'press'],
  },
  {
    id: 'news-feed',
    name: 'News Feed',
    shortform: 'NF',
    keywords: ['news', 'feed', 'headlines', 'sources', 'wire'],
  },
  {
    id: 'chart',
    name: 'Chart',
    shortform: 'GP',
    keywords: ['chart', 'graph', 'price', 'candlestick', 'timeseries'],
  },
  {
    id: 'graphic-dashboard',
    name: 'Graphic Dashboard',
    shortform: 'GD',
    keywords: ['graphic', 'dashboard', 'gd', 'metrics', 'tiles', 'sparkline'],
  },
  {
    id: 'world-equity-indices',
    name: 'World Equity Indices',
    shortform: 'WEI',
    keywords: ['world', 'equity', 'indices', 'wei', 'index', 'global', 'markets'],
  },
  {
    id: 'international-clock',
    name: 'International Clock',
    shortform: 'IC',
    keywords: ['clock', 'time', 'timezone', 'international', 'world'],
  },
  {
    id: 'financial-analysis',
    name: 'Financial Analysis',
    shortform: 'FA',
    keywords: ['financial', 'analysis', 'fundamentals', 'statements', 'earnings'],
  },
  {
    id: 'relative-valuation',
    name: 'Relative Valuation',
    shortform: 'RV',
    keywords: ['relative', 'valuation', 'peers', 'multiples', 'comps'],
  },
]

/** Search the widget catalog. Empty query returns no results — type to search. */
export function searchWidgets(query: string): WidgetDefinition[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return LAUNCHPAD_WIDGETS.filter((widget) => {
    if (widget.shortform?.toLowerCase() === q) return true
    if (widget.shortform?.toLowerCase().startsWith(q)) return true
    if (widget.name.toLowerCase().includes(q)) return true
    return widget.keywords.some(
      (k) => k.includes(q) || q.includes(k),
    )
  })
}
