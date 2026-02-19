import { CHART_COLORS } from '../../theme/themeConfig'

export { CHART_COLORS }

export const tooltipStyle = {
  contentStyle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
}

export function currencyFormatter(value) {
  if (value == null || isNaN(value)) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function numberFormatter(value) {
  if (value == null || isNaN(value)) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}
