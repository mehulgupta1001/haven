/**
 * Haven brand palette: institutional navy, paper white, emerald affirmation.
 * Aligns with "traditional bank meets tech" — avoid playful pastels.
 */
export const colors = {
  /** UCL-adjacent institutional navy — primary brand */
  navy: '#002147',
  navyLight: '#0D3A6B',
  navyMuted: '#1E3A5F',
  paper: '#FFFFFF',
  paperWarm: '#F7F8FA',
  ink: '#0B1220',
  inkSecondary: '#4A5568',
  inkTertiary: '#718096',
  border: '#E2E8F0',
  borderStrong: '#CBD5E0',
  /** Success / protected / verified */
  emerald: '#059669',
  emeraldDark: '#047857',
  emeraldMuted: '#D1FAE5',
  /** Warning / pending */
  amber: '#D97706',
  amberMuted: '#FEF3C7',
  /** Critical (sparingly) */
  crimson: '#B91C1C',
} as const;

export type HavenColors = typeof colors;
