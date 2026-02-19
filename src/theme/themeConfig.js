export const themes = {
  donor: {
    name: 'Donor',
    primary: '#4CAF50',
    light: '#C8E6C9',
    dark: '#2E7D32',
    bg: '#E8F5E9',
    rgb: '76, 175, 80',
  },
  vendor: {
    name: 'Vendor',
    primary: '#E91E63',
    light: '#F8BBD0',
    dark: '#AD1457',
    bg: '#FCE4EC',
    rgb: '233, 30, 99',
  },
  costshare: {
    name: 'Cost-Share',
    primary: '#1976D2',
    light: '#BBDEFB',
    dark: '#0D47A1',
    bg: '#E3F2FD',
    rgb: '25, 118, 210',
  },
  master: {
    name: 'Master',
    primary: '#FF9800',
    light: '#FFE0B2',
    dark: '#E65100',
    bg: '#FFF3E0',
    rgb: '255, 152, 0',
  },
}

export const CHART_COLORS = [
  '#87CEEB', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6',
  '#EE82EE', '#FF69B4', '#FF1493', '#FF6347', '#FA8072',
  '#FFB347', '#F0E68C', '#9ACD32', '#90EE90', '#00FA9A',
]

export const routeToTheme = {
  '/': 'master',
  '/donor': 'donor',
  '/vendor': 'vendor',
  '/cost-share': 'costshare',
  '/master': 'master',
}
