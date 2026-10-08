import { Box, Paper, Typography } from '@mui/material';

/** Sprint-0 placeholder page. Real pages arrive with their features. */
export function HomePage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, maxWidth: 640, width: '100%' }} elevation={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agency Management System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Technical foundation is running. Feature pages (login, dashboard,
          users, …) will be implemented during the sprint work.
        </Typography>
      </Paper>
    </Box>
  );
}

export default HomePage;
