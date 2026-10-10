import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import {
  USER_ROLES,
  USER_TEAMS,
  validateUserForm,
  type UserFormErrors,
} from '../types/users.types';

/** Add User screen: full-page invite form with the same validation as the Users dialog — local preview only. */
export function AddUserPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(USER_ROLES[3]);
  const [team, setTeam] = useState<string>(USER_TEAMS[1]);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [flash, setFlash] = useState<string | null>(null);

  function handleSubmit() {
    const nextErrors = validateUserForm({ name, email, role, team });
    setErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.email) return;
    setFlash(`Invite sent to ${name.trim()} (local preview — not saved).`);
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            GOVERNANCE & SECURITY • Access Management
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Add User
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Invite a team member to the workspace. Uses the same validation as the Users directory dialog.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/users" variant="outlined">
            Back to Users List
          </Button>
        </Box>
      </Box>

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Typography variant="h6" component="h3">
              User details
            </Typography>
            <Chip label="Local preview — no backend call" size="small" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 640 }}>
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name ?? ' '}
              fullWidth
              required
            />
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email ?? ' '}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel id="add-user-role-label">Role</InputLabel>
                <Select labelId="add-user-role-label" label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {USER_ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel id="add-user-team-label">Team</InputLabel>
                <Select labelId="add-user-team-label" label="Team" value={team} onChange={(e) => setTeam(e.target.value)}>
                  {USER_TEAMS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleSubmit}>
                Send invite
              </Button>
              <Button variant="outlined" onClick={() => navigate('/users')}>
                View Users List
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default AddUserPage;
