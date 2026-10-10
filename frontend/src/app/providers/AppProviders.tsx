import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { store } from '../store/store';
import theme from '../../core/theme/theme';
import { AuthProvider } from '../../core/auth/AuthContext';

interface AppProvidersProps {
  children: ReactNode;
}

/** Global providers: Redux + MUI theme + CSS baseline + session. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default AppProviders;
