import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import { getApiErrorMessage } from '../../../core/api/errors';
import { usersService, type BackendRole } from '../services/users.service';
import {
  BACKEND_ROLES,
  CREATABLE_ROLES,
  validateUserForm,
  type UserFormErrors,
} from '../types/users.types';

/** Add User screen: full-page invite form — creates via `POST /api/v1/users`. */
export function AddUserPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<BackendRole>('employee');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors = validateUserForm({ name, email, role, password }, true);
    setErrors(nextErrors);
    setServerError(null);
    if (nextErrors.name ?? nextErrors.email ?? nextErrors.password) return;
    setSubmitting(true);
    try {
      const created = await usersService.create({ name: name.trim(), email: email.trim(), role, password });
      navigate('/users', { state: { flash: `Invite sent to ${created.name} — temporary password set.` } });
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
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
            Invite a team member to the workspace. They sign in with the temporary password below.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/users" variant="outlined">
            Back to Users List
          </Button>
        </Box>
      </Box>

      {serverError ? (
        <Alert severity="error" role="alert" onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            User details
          </Typography>
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
                <Select labelId="add-user-role-label" label="Role" value={role} onChange={(e) => setRole(e.target.value as BackendRole)}>
                  {BACKEND_ROLES.filter((r) => CREATABLE_ROLES.includes(r.value)).map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Temporary password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(errors.password)}
                helperText={errors.password ?? 'Min 8, upper + lower + digit + special'}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => void handleSubmit()} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send invite'}
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
