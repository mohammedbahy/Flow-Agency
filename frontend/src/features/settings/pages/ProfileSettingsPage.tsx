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
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import { DEMO_USER } from '../../../shared/components/workspace';
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

/** Profile Settings screen: admin identity editing + mock password change. Nothing is persisted. */
export function ProfileSettingsPage() {
  const [name, setName] = useState<string>(DEMO_USER.name);
  const [email, setEmail] = useState<string>(DEMO_USER.email);
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [toast, setToast] = useState<string | null>(null);

  function handleSaveProfile() {
    const nextErrors = validateProfileForm({ name, email });
    setProfileErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.email) return;
    setToast('Profile updated in local preview — nothing was sent to a backend.');
  }

  function handleChangePassword() {
    const nextErrors = validatePasswordForm({ current, next, confirm });
    setPasswordErrors(nextErrors);
    if (nextErrors.current ?? nextErrors.next ?? nextErrors.confirm) return;
    setCurrent('');
    setNext('');
    setConfirm('');
    setToast('Password change is disabled in this preview — no password was changed.');
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings • Admin"
        title="Profile Settings"
        subtitle="Your administrator identity and sign-in credentials. Changes stay in the local preview."
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }} aria-hidden>
                  {DEMO_USER.initials}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {DEMO_USER.role} • Super Admin access
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
                <Button variant="contained" onClick={handleSaveProfile}>
                  Save profile
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
              <Alert severity="info" role="status">
                Mock interface only — passwords are never changed or transmitted in this preview.
              </Alert>
              <PasswordField id="pw-current" label="Current password" value={current} onChange={setCurrent} error={passwordErrors.current} />
              <PasswordField id="pw-new" label="New password" value={next} onChange={setNext} error={passwordErrors.next} helperText="At least 8 characters." />
              <PasswordField id="pw-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} error={passwordErrors.confirm} />
              <Box>
                <Button variant="contained" onClick={handleChangePassword}>
                  Update password
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
