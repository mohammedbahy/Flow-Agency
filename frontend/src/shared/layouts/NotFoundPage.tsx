import { Box, Button, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/** Fallback for unknown URLs. */
export function NotFoundPage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Page not found
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          The page you are looking for does not exist in this UI preview.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Go to dashboard
        </Button>
      </Paper>
    </Box>
  );
}

export default NotFoundPage;
