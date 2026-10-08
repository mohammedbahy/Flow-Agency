import { Outlet } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { APP_NAME } from '../../core/constants/app.constants';

/** Minimal application shell proving React + MUI render successfully. */
export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            {APP_NAME}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default AppLayout;
