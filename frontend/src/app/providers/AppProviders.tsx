import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { store } from '../store/store';
import theme from '../../core/theme/theme';

interface AppProvidersProps {
  children: ReactNode;
}

/** Global providers: Redux + MUI theme + CSS baseline. */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  );
}

export default AppProviders;
