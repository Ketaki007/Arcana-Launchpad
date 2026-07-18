export type FactorRow = {
  id: string
  name: string
  change1d: number
  zScore: number
}

export type FactorTable = {
  id: string
  title: string
  rows: FactorRow[]
}

export const sidebarItems = [
  'Live Factor Movers',
  'Core Factors',
  'Factor Loadings',
  'Single Stock Idio',
  'Custom Factors',
  'Industry Factors',
  'Correlations',
  'Sharpe Ratios',
  'Volatility',
  'Beta',
  'Top Assets Decomp',
  'Estimates',
  'Positioning',
] as const

export const factorTables: FactorTable[] = [
  {
    id: 'core-1d',
    title: 'Core Factors - 1D Movers',
    rows: [
      { id: '1', name: 'Beta Nonlinearity - ARM1', change1d: 0.32, zScore: 3.0 },
      { id: '2', name: 'Short Interest - ARM1', change1d: -0.28, zScore: -1.5 },
      { id: '3', name: 'Earnings Yield - ARM1', change1d: 0.18, zScore: 2.2 },
      { id: '4', name: 'Momentum 12-1 - ARM1', change1d: 0.41, zScore: 1.8 },
      { id: '5', name: 'Value Composite - ARM1', change1d: -0.12, zScore: -0.9 },
      { id: '6', name: 'Quality Score - ARM1', change1d: 0.09, zScore: 0.3 },
      { id: '7', name: 'Size Factor - ARM1', change1d: -0.05, zScore: -0.4 },
      { id: '8', name: 'Liquidity - ARM1', change1d: 0.22, zScore: 1.1 },
    ],
  },
  {
    id: 'industry-1d',
    title: 'Industry Factors - 1D Movers',
    rows: [
      { id: '1', name: 'Semiconductors - IND', change1d: 0.54, zScore: 2.6 },
      { id: '2', name: 'Software - IND', change1d: 0.21, zScore: 1.4 },
      { id: '3', name: 'Banks - IND', change1d: -0.33, zScore: -1.8 },
      { id: '4', name: 'Energy - IND', change1d: 0.17, zScore: 0.8 },
      { id: '5', name: 'Healthcare - IND', change1d: -0.08, zScore: -0.3 },
      { id: '6', name: 'Retail - IND', change1d: 0.12, zScore: 0.5 },
      { id: '7', name: 'Utilities - IND', change1d: -0.15, zScore: -0.7 },
      { id: '8', name: 'Industrials - IND', change1d: 0.06, zScore: 0.2 },
    ],
  },
  {
    id: 'custom-1d',
    title: 'Custom Factors - 1D Movers',
    rows: [
      { id: '1', name: 'AI Exposure Basket', change1d: 0.67, zScore: 2.9 },
      { id: '2', name: 'Crowding Score', change1d: -0.41, zScore: -2.1 },
      { id: '3', name: 'Revision Momentum', change1d: 0.29, zScore: 1.6 },
      { id: '4', name: 'Flow Pressure', change1d: -0.19, zScore: -1.0 },
      { id: '5', name: 'Earnings Surprise', change1d: 0.38, zScore: 2.0 },
      { id: '6', name: 'Vol Regime', change1d: 0.11, zScore: 0.4 },
      { id: '7', name: 'Macro Sensitivity', change1d: -0.07, zScore: -0.2 },
      { id: '8', name: 'Peer Relative Value', change1d: 0.15, zScore: 0.7 },
    ],
  },
  {
    id: 'volatility-1d',
    title: 'Volatility - 1D Movers',
    rows: [
      { id: '1', name: 'Idio Vol - High', change1d: 0.44, zScore: 2.4 },
      { id: '2', name: 'Idio Vol - Low', change1d: -0.22, zScore: -1.2 },
      { id: '3', name: 'Realized Vol 20d', change1d: 0.31, zScore: 1.7 },
      { id: '4', name: 'Implied Vol Spread', change1d: -0.36, zScore: -1.9 },
      { id: '5', name: 'Vol of Vol', change1d: 0.08, zScore: 0.3 },
      { id: '6', name: 'Downside Vol', change1d: -0.14, zScore: -0.6 },
      { id: '7', name: 'Jump Risk', change1d: 0.25, zScore: 1.3 },
      { id: '8', name: 'Skew Factor', change1d: -0.09, zScore: -0.4 },
    ],
  },
]
