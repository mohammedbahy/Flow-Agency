import { createTheme } from '@mui/material/styles';

/** Base MUI theme — Sprint 0 default; UI/UX track owns visual evolution. */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
});

export default theme;
