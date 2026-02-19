export const themes = {
  donor: {
    name: 'Donor',
    primary: '#8EC75A',
    light: '#D4EABC',
    dark: '#5A8A2E',
    bg: '#EDF6E3',
    rgb: '142, 199, 90',
  },
  vendor: {
    name: 'Vendor',
    primary: '#FC38A4',
    light: '#FEB5D6',
    dark: '#C4206E',
    bg: '#FEE5F0',
    rgb: '252, 56, 164',
  },
  costshare: {
    name: 'Cost-Share',
    primary: '#4CA5C2',
    light: '#BDE0EC',
    dark: '#2D7A94',
    bg: '#E3F2F7',
    rgb: '76, 165, 194',
  },
  master: {
    name: 'Master',
    primary: '#CE33D6',
    light: '#EDBCF0',
    dark: '#9A1FA0',
    bg: '#F5E3F6',
    rgb: '206, 51, 214',
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
