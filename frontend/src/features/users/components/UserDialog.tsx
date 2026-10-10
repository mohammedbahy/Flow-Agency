import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { BackendRole } from '../services/users.service';
import {
  BACKEND_ROLES,
  CREATABLE_ROLES,
  validateUserForm,
  type DirectoryUser,
  type UserFormErrors,
  type UserFormValues,
} from '../types/users.types';

interface UserDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: DirectoryUser | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  submitting?: boolean;
}

/** Invite/edit team member dialog. Create requires a temporary password (backend policy). */
export function UserDialog({ open, mode, initial, onClose, onSubmit, submitting = false }: UserDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState<BackendRole>(initial?.role ?? 'employee');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<UserFormErrors>({});

  const dialogKey = initial?.id ?? mode;
  const [lastKey, setLastKey] = useState(dialogKey);
  if (lastKey !== dialogKey) {
    setLastKey(dialogKey);
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
    setRole(initial?.role ?? 'employee');
    setPassword('');
    setErrors({});
  }

  const roleOptions = mode === 'create' ? BACKEND_ROLES.filter((r) => CREATABLE_ROLES.includes(r.value)) : BACKEND_ROLES;

  function handleSubmit() {
    const nextErrors = validateUserForm({ name, email, role, password }, mode === 'create');
    setErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.email ?? nextErrors.password) return;
    onSubmit({ name: name.trim(), email: email.trim(), role, password });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Invite Team Member' : 'Edit user'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        {mode === 'create' ? (
          <Alert severity="info" role="status" sx={{ mt: 0.5 }}>
            The member signs in with this temporary password and must change it on first login. Only
            managers and employees can be invited here.
          </Alert>
        ) : null}
        <TextField
          id="user-full-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name ?? ' '}
          fullWidth
          required
          sx={{ mt: mode === 'create' ? 0 : 0.5 }}
        />
        <TextField
          id="user-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(errors.email)}
          helperText={errors.email ?? ' '}
          fullWidth
          required
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: mode === 'create' ? 6 : 12 }}>
            <FormControl fullWidth>
              <InputLabel id="user-role-label">Role</InputLabel>
              <Select labelId="user-role-label" id="user-role" label="Role" value={role} onChange={(e) => setRole(e.target.value as BackendRole)}>
                {roleOptions.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {mode === 'create' ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="user-password"
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
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {mode === 'create' ? 'Send invite' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserDialog;
