import {
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
import { useState } from 'react';
import {
  USER_ROLES,
  USER_TEAMS,
  validateUserForm,
  type MockUser,
  type UserFormErrors,
  type UserFormValues,
} from '../types/users.types';

interface UserDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: MockUser | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

/** Invite/edit team member dialog with client-side validation (local state only). */
export function UserDialog({ open, mode, initial, onClose, onSubmit }: UserDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [role, setRole] = useState(initial?.role ?? USER_ROLES[3]);
  const [team, setTeam] = useState(initial?.team ?? USER_TEAMS[1]);
  const [errors, setErrors] = useState<UserFormErrors>({});

  const dialogKey = initial?.id ?? mode;
  const [lastKey, setLastKey] = useState(dialogKey);
  if (lastKey !== dialogKey) {
    setLastKey(dialogKey);
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
    setRole(initial?.role ?? USER_ROLES[3]);
    setTeam(initial?.team ?? USER_TEAMS[1]);
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateUserForm({ name, email, role, team });
    setErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.email) return;
    onSubmit({ name: name.trim(), email: email.trim(), role, team });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Invite Team Member' : 'Edit user'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          id="user-full-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name ?? ' '}
          fullWidth
          required
          sx={{ mt: 0.5 }}
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="user-role-label">Role</InputLabel>
              <Select labelId="user-role-label" id="user-role" label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                {USER_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="user-team-label">Team</InputLabel>
              <Select labelId="user-team-label" id="user-team" label="Team" value={team} onChange={(e) => setTeam(e.target.value)}>
                {USER_TEAMS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'create' ? 'Send invite' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserDialog;
