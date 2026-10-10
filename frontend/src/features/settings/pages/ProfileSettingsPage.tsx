import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useSearchParams } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import { authService } from '../../authentication/services/auth.service';
import { usersService } from '../../users/services/users.service';
import {
  validatePasswordForm,
  validateProfileForm,
  type PasswordFormErrors,
  type ProfileFormErrors,
} from '../types/settings.types';

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  helperText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete="new-password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={Boolean(error)}
      helperText={error ?? helperText ?? ' '}
      fullWidth
      required
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? `Hide ${label}` : `Show ${label}`}
              >
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

/** Profile Settings screen: live identity (PATCH /users/:id) + real password change. */
export function ProfileSettingsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState<string>(user?.name ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleSaveProfile() {
    const nextErrors = validateProfileForm({ name, email });
    setProfileErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.email) return;
    if (!user) return;
    setSavingProfile(true);
    try {
      await usersService.update(user.id, { name: name.trim(), email: email.trim() });
      setToast('Profile updated successfully.');
    } catch (error) {
      setToast(getApiErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    const nextErrors = validatePasswordForm({ current, next, confirm });
    setPasswordErrors(nextErrors);
    if (nextErrors.current ?? nextErrors.next ?? nextErrors.confirm) return;
    setChangingPassword(true);
    try {
      const message = await authService.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      // Backend bumps tokenVersion → current JWT is dead; sign in again.
      setToast(`${message} Please sign in again.`);
    } catch (error) {
      setToast(getApiErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings • Admin"
        title="Profile Settings"
        subtitle="Your administrator identity and sign-in credentials."
      />

      {searchParams.get('reason') === 'must-change-password' ? (
        <Alert severity="warning" role="status">
          Your account requires a password change before continuing.
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }} aria-hidden>
                  {initials}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {name || user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.role} • {user?.email}
                  </Typography>
                </Box>
              </Box>
              <TextField
                id="profile-name"
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={Boolean(profileErrors.name)}
                helperText={profileErrors.name ?? ' '}
                fullWidth
                required
              />
              <TextField
                id="profile-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(profileErrors.email)}
                helperText={profileErrors.email ?? ' '}
                fullWidth
                required
              />
              <Box>
                <Button variant="contained" onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" component="h3">
                Change password
              </Typography>
              <PasswordField id="pw-current" label="Current password" value={current} onChange={setCurrent} error={passwordErrors.current} />
              <PasswordField id="pw-new" label="New password" value={next} onChange={setNext} error={passwordErrors.next} helperText="Min 8 chars, upper + lower + digit + special." />
              <PasswordField id="pw-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} error={passwordErrors.confirm} />
              <Box>
                <Button variant="contained" onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? 'Updating…' : 'Update password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={toast !== null} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default ProfileSettingsPage;
