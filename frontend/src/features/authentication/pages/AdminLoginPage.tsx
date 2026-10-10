import { Avatar, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { Link as RouterLink } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { PRODUCT_NAME } from '../../../shared/components/workspace';

/** Admin Login screen: same sign-in form restricted to admins — real backend auth. */
export function AdminLoginPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#FFFFFF', borderRadius: 2, fontWeight: 800 }} variant="rounded" src="/neurteq-icon.svg" alt="Neurteq">
              N
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {PRODUCT_NAME} Admin
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Restricted workspace console
              </Typography>
            </Box>
            <Chip icon={<ShieldIcon />} label="ADMIN" size="small" color="primary" variant="outlined" sx={{ ml: 'auto' }} />
          </Box>
          <LoginForm adminOnly />
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            Not an admin? <RouterLink to="/login">Go to workspace sign-in</RouterLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminLoginPage;
