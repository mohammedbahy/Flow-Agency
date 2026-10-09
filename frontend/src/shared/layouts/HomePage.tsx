import { Box, Button, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/** Landing page linking to the Sprint 1 UI-preview screens. */
export function HomePage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, maxWidth: 640, width: '100%' }} elevation={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agency Management System
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Sprint 1 UI preview — screens are openly reviewable (no sign-in
          required). All data on these screens is static mock state.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
          <Button component={RouterLink} to="/login" variant="outlined">
            Login
          </Button>
          <Button component={RouterLink} to="/dashboard" variant="contained">
            Dashboard
          </Button>
          <Button component={RouterLink} to="/users" variant="outlined">
            Users & Access
          </Button>
          <Button component={RouterLink} to="/reviews" variant="outlined">
            Reviews
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default HomePage;
