export type Security = {
  ticker: string
  name: string
  last: number
  changePct: number
  volume: string
  sector: string
}

export const SECURITIES: Security[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp',
    last: 131.28,
    changePct: 2.41,
    volume: '48.2M',
    sector: 'Technology',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc',
    last: 214.15,
    changePct: -0.38,
    volume: '32.1M',
    sector: 'Technology',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp',
    last: 428.9,
    changePct: 0.72,
    volume: '18.6M',
    sector: 'Technology',
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    last: 162.44,
    changePct: 1.85,
    volume: '41.0M',
    sector: 'Technology',
  },
  {
    ticker: 'META',
    name: 'Meta Platforms',
    last: 512.3,
    changePct: -1.12,
    volume: '14.8M',
    sector: 'Communication',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc',
    last: 178.62,
    changePct: 0.45,
    volume: '21.3M',
    sector: 'Communication',
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc',
    last: 248.5,
    changePct: -2.05,
    volume: '72.4M',
    sector: 'Consumer',
  },
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase',
    last: 198.4,
    changePct: 0.28,
    volume: '9.2M',
    sector: 'Financials',
  },
]

export const NEWS_ITEMS = [
  {
    id: 'n1',
    ticker: 'NVDA',
    headline: 'NVIDIA raises data-center outlook amid AI demand',
    source: 'Bloomberg',
    time: '14m',
  },
  {
    id: 'n2',
    ticker: 'NVDA',
    headline: 'Chip peers rally as hyperscaler spend accelerates',
    source: 'Reuters',
    time: '1h',
  },
  {
    id: 'n3',
    ticker: 'AMD',
    headline: 'AMD expands MI300 shipments to cloud providers',
    source: 'WSJ',
    time: '2h',
  },
  {
    id: 'n4',
    ticker: 'AAPL',
    headline: 'Apple services growth offsets softer iPhone sales',
    source: 'FT',
    time: '3h',
  },
  {
    id: 'n5',
    ticker: 'MSFT',
    headline: 'Microsoft Azure margins expand on AI workloads',
    source: 'CNBC',
    time: '4h',
  },
  {
    id: 'n6',
    ticker: 'META',
    headline: 'Meta increases AI infrastructure capex guidance',
    source: 'Bloomberg',
    time: '5h',
  },
]

export const FINANCIALS: Record<
  string,
  { metric: string; ttm: string; yoy: string; consensus: string }[]
> = {
  NVDA: [
    { metric: 'Revenue', ttm: '$96.0B', yoy: '+122%', consensus: '$94.2B' },
    { metric: 'Gross Margin', ttm: '75.5%', yoy: '+9.2pp', consensus: '74.8%' },
    { metric: 'EPS', ttm: '$2.94', yoy: '+168%', consensus: '$2.88' },
    { metric: 'FCF', ttm: '$40.1B', yoy: '+210%', consensus: '$38.0B' },
  ],
  AAPL: [
    { metric: 'Revenue', ttm: '$391B', yoy: '+2.1%', consensus: '$389B' },
    { metric: 'Gross Margin', ttm: '46.2%', yoy: '+0.4pp', consensus: '46.0%' },
    { metric: 'EPS', ttm: '$6.72', yoy: '+8%', consensus: '$6.65' },
    { metric: 'FCF', ttm: '$99B', yoy: '+5%', consensus: '$97B' },
  ],
  AMD: [
    { metric: 'Revenue', ttm: '$25.8B', yoy: '+14%', consensus: '$25.2B' },
    { metric: 'Gross Margin', ttm: '52.1%', yoy: '+3.1pp', consensus: '51.5%' },
    { metric: 'EPS', ttm: '$2.12', yoy: '+22%', consensus: '$2.05' },
    { metric: 'FCF', ttm: '$3.4B', yoy: '+18%', consensus: '$3.1B' },
  ],
}

export const DESCRIPTIONS: Record<string, string> = {
  NVDA: 'NVIDIA designs GPUs and systems for gaming, professional visualization, data centers and automotive. AI accelerators and CUDA software are the primary growth engines.',
  AAPL: 'Apple designs and sells consumer electronics, software and services. iPhone remains the core franchise, with Services and Wearables contributing growing high-margin revenue.',
  AMD: 'AMD designs CPUs, GPUs and accelerators for PCs, gaming and data centers. Competitive positioning versus NVIDIA in AI GPUs is a key analytical focus.',
  MSFT: 'Microsoft provides productivity software, cloud infrastructure (Azure) and enterprise platforms. AI copilots and Azure growth drive the current investment narrative.',
}

export const PEERS = [
  { ticker: 'NVDA', pe: 58.2, ps: 32.1, evEbitda: 48.5 },
  { ticker: 'AMD', pe: 42.1, ps: 11.4, evEbitda: 34.2 },
  { ticker: 'AVGO', pe: 36.8, ps: 14.2, evEbitda: 28.9 },
  { ticker: 'INTC', pe: null as number | null, ps: 2.1, evEbitda: 12.4 },
]

export const CHART_SERIES: Record<string, number[]> = {
  NVDA: [98, 102, 101, 108, 115, 112, 118, 124, 121, 128, 130, 131],
  AAPL: [205, 208, 210, 207, 212, 215, 213, 216, 214, 217, 215, 214],
  AMD: [140, 145, 148, 146, 152, 155, 150, 158, 160, 157, 161, 162],
  MSFT: [400, 405, 410, 408, 415, 420, 418, 425, 422, 430, 427, 429],
}

export function getSecurity(ticker: string): Security {
  return SECURITIES.find((s) => s.ticker === ticker) ?? SECURITIES[0]!
}

/** Bloomberg-style news feed rows (source codes + wall-clock times). */
export type NewsFeedDay = 'today' | 'yesterday' | 'week'

export const NEWS_FEED_ITEMS: {
  id: string
  headline: string
  source: string
  time: string
  day: NewsFeedDay
  accent: boolean
}[] = [
  {
    id: 'nf1',
    headline: "Nikkei Asian Review: With the prospect of Tesla's in...",
    source: 'TWT',
    time: '17:20',
    day: 'today',
    accent: false,
  },
  {
    id: 'nf2',
    headline: 'The hidden risk in your S&P 500 index fund',
    source: 'DJ',
    time: '17:00',
    day: 'today',
    accent: false,
  },
  {
    id: 'nf3',
    headline: 'S&P 500 Posts 1.25% Weekly Gain, Led by Industrials...',
    source: 'MTN',
    time: '16:44',
    day: 'today',
    accent: false,
  },
  {
    id: 'nf4',
    headline: 'Reuters U.S. News: S&P 500 ends higher as traders...',
    source: 'APW',
    time: '16:30',
    day: 'yesterday',
    accent: false,
  },
  {
    id: 'nf5',
    headline: 'Fed speakers reinforce higher-for-longer rate path',
    source: 'BFW',
    time: '16:12',
    day: 'yesterday',
    accent: true,
  },
  {
    id: 'nf6',
    headline: 'Mega-cap tech leads afternoon rebound in broad tape',
    source: 'DJ',
    time: '15:58',
    day: 'week',
    accent: false,
  },
  {
    id: 'nf7',
    headline: 'Oil steadies as inventory draw offsets demand worries',
    source: 'MTN',
    time: '15:41',
    day: 'week',
    accent: false,
  },
  {
    id: 'nf8',
    headline: 'Treasury yields ease after soft retail sales print',
    source: 'BFW',
    time: '15:22',
    day: 'week',
    accent: true,
  },
]

export const NEWS_FEED_SOURCES = [
  { code: 'DJ', label: 'Dow Jones' },
  { code: 'BFW', label: 'Bloomberg' },
  { code: 'MTN', label: 'Market News' },
  { code: 'APW', label: 'AP / Reuters' },
  { code: 'TWT', label: 'Twitter' },
] as const

export type DashboardTile = {
  id: string
  title: string
  value: string
  sub?: string
  tone?: 'pos' | 'neg' | 'neutral' | 'accent'
  series?: number[]
  kind?: 'line' | 'bars' | 'dual' | 'text'
}

export function graphicDashboardTiles(ticker: string): DashboardTile[] {
  const s = getSecurity(ticker)
  const series = CHART_SERIES[ticker] ?? CHART_SERIES.NVDA!
  return [
    {
      id: 'price',
      title: 'Price (2D)',
      value: s.last.toFixed(2),
      tone: 'neutral',
      series,
      kind: 'line',
    },
    {
      id: 'peer',
      title: 'Peer Avg (1D)',
      value: '-1.55%',
      sub: '7 Movers',
      tone: 'neg',
      series: [4, 2, 6, 1, 5, 3, 7],
      kind: 'bars',
    },
    {
      id: 'avat',
      title: 'Δ 20D AVAT (1D)',
      value: '-31.9%',
      tone: 'neg',
      series: [10, 14, 18, 22, 28, 34, 40],
      kind: 'dual',
    },
    {
      id: 'events',
      title: 'News Events',
      value: '6 Days',
      sub: 'Next Earnings',
      tone: 'accent',
      kind: 'text',
    },
    {
      id: 'eps',
      title: 'BEst EPS (3M)',
      value: '-17.39',
      sub: 'FY 2026',
      tone: 'neutral',
      series: [20, 18, 16, 14, 15, 13, 12, 11],
      kind: 'line',
    },
    {
      id: 'rtg',
      title: 'Consensus Rtg',
      value: '2.47',
      tone: 'neutral',
    },
    {
      id: 'chg1',
      title: '1D %Chg (20D)',
      value: '-4.34%',
      tone: 'neg',
    },
    {
      id: 'chg2',
      title: '1D %Chg (20D)',
      value: '-2.11%',
      tone: 'neg',
    },
    {
      id: 'ba',
      title: 'Bid/Ask % (30m)',
      value: '47% / 10%',
      tone: 'neg',
    },
    {
      id: 'insider',
      title: 'Insider Pct (1Y)',
      value: '1.20%',
      tone: 'neutral',
    },
  ]
}

export type EquityIndexRow = {
  name: string
  spark: number[]
  value: string
  delayed?: boolean
  netChg: number
  pctChg: number
  avat: number
  time: string
  adv: number
  dcl: number
  ytd: number
  ytdCur: number
}

function spark(seed: number): number[] {
  const out: number[] = []
  let v = 50 + (seed % 7)
  for (let i = 0; i < 24; i++) {
    v += Math.sin(i * 0.55 + seed) * 2.2 + ((seed * (i + 3)) % 5) - 2
    out.push(v)
  }
  return out
}

export const WORLD_EQUITY_REGIONS: {
  region: string
  rows: EquityIndexRow[]
}[] = [
  {
    region: 'Americas',
    rows: [
      {
        name: 'S&P/TSX Comp',
        spark: spark(11),
        value: '22,158.40',
        delayed: true,
        netChg: 42.1,
        pctChg: 0.19,
        avat: 1.4,
        time: '16:00',
        adv: 128,
        dcl: 94,
        ytd: 8.2,
        ytdCur: 6.1,
      },
      {
        name: 'IBOVESPA',
        spark: spark(12),
        value: '126,842.00',
        delayed: true,
        netChg: 310.5,
        pctChg: 0.25,
        avat: 2.8,
        time: '17:00',
        adv: 210,
        dcl: 140,
        ytd: 4.6,
        ytdCur: 2.9,
      },
      {
        name: 'S&P 500',
        spark: spark(13),
        value: '5,290.42',
        delayed: true,
        netChg: 18.6,
        pctChg: 0.35,
        avat: 1.8,
        time: '16:00',
        adv: 312,
        dcl: 188,
        ytd: 15.2,
        ytdCur: 12.8,
      },
      {
        name: 'DOW JONES',
        spark: spark(14),
        value: '39,112.15',
        delayed: true,
        netChg: 84.2,
        pctChg: 0.22,
        avat: 2.1,
        time: '16:00',
        adv: 18,
        dcl: 12,
        ytd: 12.4,
        ytdCur: 10.1,
      },
      {
        name: 'NASDAQ',
        spark: spark(15),
        value: '16,503.19',
        delayed: true,
        netChg: 29.36,
        pctChg: 0.28,
        avat: 3.65,
        time: '16:00',
        adv: 248,
        dcl: 162,
        ytd: 17.06,
        ytdCur: 14.4,
      },
    ],
  },
  {
    region: 'EMEA',
    rows: [
      {
        name: 'IBEX 35',
        spark: spark(21),
        value: '11,248.70',
        netChg: 38.2,
        pctChg: 0.34,
        avat: 1.9,
        time: '17:30',
        adv: 22,
        dcl: 13,
        ytd: 11.4,
        ytdCur: 9.8,
      },
      {
        name: 'RTS $',
        spark: spark(22),
        value: '1,142.30',
        netChg: 6.4,
        pctChg: 0.56,
        avat: 4.2,
        time: '17:45',
        adv: 28,
        dcl: 16,
        ytd: 9.1,
        ytdCur: 7.6,
      },
      {
        name: 'CAC 40',
        spark: spark(23),
        value: '7,628.90',
        netChg: 11.2,
        pctChg: 0.15,
        avat: 1.1,
        time: '17:30',
        adv: 24,
        dcl: 16,
        ytd: 5.4,
        ytdCur: 4.2,
      },
      {
        name: 'FTSE 100',
        spark: spark(24),
        value: '8,235.60',
        netChg: -12.4,
        pctChg: -0.15,
        avat: -0.8,
        time: '16:35',
        adv: 42,
        dcl: 58,
        ytd: 6.1,
        ytdCur: 6.1,
      },
      {
        name: 'Euro Stoxx 50',
        spark: spark(25),
        value: '5,018.40',
        netChg: 8.9,
        pctChg: 0.18,
        avat: 1.6,
        time: '17:30',
        adv: 31,
        dcl: 19,
        ytd: 10.2,
        ytdCur: 8.7,
      },
      {
        name: 'OMX STKH30',
        spark: spark(26),
        value: '2,548.10',
        netChg: 4.2,
        pctChg: 0.17,
        avat: 0.9,
        time: '17:30',
        adv: 18,
        dcl: 12,
        ytd: 7.8,
        ytdCur: 6.4,
      },
      {
        name: 'FTSE MIB',
        spark: spark(27),
        value: '34,210.80',
        netChg: 62.4,
        pctChg: 0.18,
        avat: 1.3,
        time: '17:30',
        adv: 26,
        dcl: 14,
        ytd: 13.1,
        ytdCur: 11.2,
      },
      {
        name: 'AEX',
        spark: spark(28),
        value: '892.40',
        netChg: 1.8,
        pctChg: 0.2,
        avat: 1.0,
        time: '17:30',
        adv: 15,
        dcl: 10,
        ytd: 9.4,
        ytdCur: 7.9,
      },
      {
        name: 'SWISS MKT',
        spark: spark(29),
        value: '11,842.50',
        netChg: 22.1,
        pctChg: 0.19,
        avat: 0.7,
        time: '17:30',
        adv: 12,
        dcl: 8,
        ytd: 5.9,
        ytdCur: 4.1,
      },
      {
        name: 'DAX',
        spark: spark(30),
        value: '18,420.55',
        netChg: -25.54,
        pctChg: -0.16,
        avat: -1.2,
        time: '17:30',
        adv: 16,
        dcl: 24,
        ytd: 9.8,
        ytdCur: 8.2,
      },
    ],
  },
  {
    region: 'Asia/Pacific',
    rows: [
      {
        name: 'NIKKEI 225',
        spark: spark(41),
        value: '39,780.25',
        delayed: true,
        netChg: -210.5,
        pctChg: -0.53,
        avat: -1.4,
        time: '06:00',
        adv: 98,
        dcl: 142,
        ytd: 14.2,
        ytdCur: 8.6,
      },
      {
        name: 'HANG SENG',
        spark: spark(42),
        value: '17,920.40',
        delayed: true,
        netChg: 42.8,
        pctChg: 0.24,
        avat: 0.9,
        time: '08:00',
        adv: 112,
        dcl: 88,
        ytd: 3.2,
        ytdCur: 1.4,
      },
      {
        name: 'ASX 200',
        spark: spark(43),
        value: '7,928.10',
        delayed: true,
        netChg: 18.4,
        pctChg: 0.23,
        avat: 1.2,
        time: '07:00',
        adv: 86,
        dcl: 74,
        ytd: 7.5,
        ytdCur: 4.8,
      },
      {
        name: 'KOSPI',
        spark: spark(44),
        value: '2,742.60',
        delayed: true,
        netChg: 12.8,
        pctChg: 0.47,
        avat: 2.2,
        time: '06:30',
        adv: 420,
        dcl: 310,
        ytd: 6.8,
        ytdCur: 3.9,
      },
      {
        name: 'Shanghai Comp',
        spark: spark(45),
        value: '3,048.20',
        delayed: true,
        netChg: -8.4,
        pctChg: -0.28,
        avat: -0.6,
        time: '07:00',
        adv: 1800,
        dcl: 2100,
        ytd: 2.1,
        ytdCur: 0.4,
      },
    ],
  },
]

export type WorldClockCity = {
  city: string
  region: string
  offsetHours: number
}

/** Full catalog of cities available in International Clock config. */
export const WORLD_CLOCKS: WorldClockCity[] = [
  { city: 'Chicago', region: 'IL, US', offsetHours: -5 },
  { city: 'New York', region: 'NY, US', offsetHours: -4 },
  { city: 'London', region: 'GB', offsetHours: 1 },
  { city: 'Hong Kong', region: 'CN', offsetHours: 8 },
  { city: 'Sydney', region: 'AU', offsetHours: 10 },
  { city: 'Tokyo', region: 'JP', offsetHours: 9 },
  { city: 'Singapore', region: 'SG', offsetHours: 8 },
  { city: 'Dubai', region: 'AE', offsetHours: 4 },
  { city: 'Frankfurt', region: 'DE', offsetHours: 1 },
  { city: 'Mumbai', region: 'IN', offsetHours: 5.5 },
  { city: 'São Paulo', region: 'BR', offsetHours: -3 },
  { city: 'Toronto', region: 'ON, CA', offsetHours: -4 },
]

export const DEFAULT_CLOCK_CITIES = [
  'Chicago',
  'New York',
  'London',
  'Hong Kong',
  'Sydney',
] as const

export function parseClockCities(raw?: string): WorldClockCity[] {
  const names = (raw ?? DEFAULT_CLOCK_CITIES.join(','))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const picked = names
    .map((name) => WORLD_CLOCKS.find((c) => c.city === name))
    .filter((c): c is WorldClockCity => Boolean(c))
  return picked.length > 0
    ? picked
    : WORLD_CLOCKS.filter((c) =>
        (DEFAULT_CLOCK_CITIES as readonly string[]).includes(c.city),
      )
}
