import { createTheme } from '@mui/material/styles';
import { kineticPalette } from './tokens';

/**
 * Kinetic application theme — approved Sprint 1 palette.
 * Inter typeface, indigo primary, slate secondary, blue tertiary,
 * dark-navy ink on light lavender-gray surfaces.
 */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: kineticPalette.primary,
      dark: kineticPalette.primaryDark,
      light: kineticPalette.primaryLight,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: kineticPalette.secondary,
      contrastText: '#FFFFFF',
    },
    info: {
      main: kineticPalette.tertiary,
      contrastText: '#FFFFFF',
    },
    success: { main: kineticPalette.success, contrastText: '#FFFFFF' },
    warning: { main: kineticPalette.warning, contrastText: '#FFFFFF' },
    error: { main: kineticPalette.error, contrastText: '#FFFFFF' },
    text: {
      primary: kineticPalette.neutral,
      secondary: kineticPalette.secondary,
    },
    background: {
      default: kineticPalette.surface,
      paper: '#FFFFFF',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
          border: '1px solid #E6E8F5',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: kineticPalette.secondary,
            borderBottom: '1px solid #E6E8F5',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid #E6E8F5' },
      },
    },
  },
});

export default theme;
