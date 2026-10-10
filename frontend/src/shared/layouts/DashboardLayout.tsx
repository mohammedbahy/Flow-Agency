import { useState, type ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/AppSidebar';
import AppTopBar from '../components/AppTopBar';
import ScrollToTop from '../components/ScrollToTop';

interface DashboardLayoutProps {
  children?: ReactNode;
}

/**
 * Authenticated-area shell: AgencyOS sidebar + top bar + page outlet.
 * Sprint 1 UI preview — no auth guard; all screens are openly reviewable.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ScrollToTop />
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppTopBar onMenuClick={() => setMobileOpen(true)} />
        <Container maxWidth="xl" sx={{ py: 3, flex: 1 }} component="main">
          {children ?? <Outlet />}
        </Container>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
