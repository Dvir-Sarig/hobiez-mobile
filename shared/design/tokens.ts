// Centralized design tokens (extracted from DesignSystemGuide)
// TODO: extend with dark mode + semantic variants later
export const tokens = {
  colors: {
    gradient: ['#0d47a1', '#1565c0', '#1e88e5'],
    primary: '#1976d2',
    primaryDark: '#0d47a1',
    glassLow: 'rgba(255,255,255,0.07)',
    glassMed: 'rgba(255,255,255,0.12)',
    glassHigh: 'rgba(255,255,255,0.18)',
    borderGlass: 'rgba(255,255,255,0.28)',
    light: '#ffffff',
    lightAlt: '#f0f7ff',
    input: '#f1f5f9',
    inputBorder: '#e2e8f0',
    textOnDark: '#ffffff',
    textSubtle: 'rgba(255,255,255,0.70)',
    textDark: '#1e293b',
    textDarkSubtle: '#516079',
    error: '#dc3545',
  },
  radius: { xl: 34, lg: 26, md: 18, sm: 14, pill: 40 },
  space: { xs: 4, sm: 8, md: 12, lg: 18, xl: 26, xxl: 34 },
  fontWeight: { heavy: '800', bold: '700', semibold: '600', medium: '500' },
  motion: { press: { toValue: 0.97, speed: 40, bounciness: 6 }, durations: { fast: 180, med: 320, slow: 500 } }
};

export const surfaces = {
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  glassButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  }
};

export const utils = {
  shadowSoft: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
};
