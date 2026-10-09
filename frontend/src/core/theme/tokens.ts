/**
 * Kinetic design tokens — approved UI/UX palette (Sprint 1).
 * Source: "Kinetic Operational Interface" design-system board.
 */
export const kineticPalette = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#EEF0FF',
  secondary: '#64748B',
  tertiary: '#3B82F6',
  neutral: '#0F172A',
  surface: '#F4F5FB',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
} as const;

export type KineticColor = keyof typeof kineticPalette;
