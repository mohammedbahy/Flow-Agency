import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import { kineticPalette } from '../../../core/theme/tokens';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import { usersService } from '../../users/services/users.service';

type ProfileTab = 'overview' | 'security';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Profile screen: live identity, real name edit, password handoff — no mock data. */
export function ProfilePage() {
  const { user, can } = useAuth();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  function openEdit() {
    setDraftName(user?.name ?? '');
    setNameError(null);
    setEditOpen(true);
  }

  async function handleSave() {
    if (!draftName.trim()) {
      setNameError('Full name is required.');
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      await usersService.update(user.id, { name: draftName.trim() });
      setFlash('Profile name updated successfully. It refreshes on your next sign-in.');
      setEditOpen(false);
    } catch (error) {
      setNameError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            WORKSPACE • Personal Settings
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your live workspace identity, backed by the backend.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/settings/profile" variant="outlined" startIcon={<LockIcon />}>
            Change Password
          </Button>
          {can('users:update') ? (
            <Button variant="contained" startIcon={<EditIcon />} onClick={openEdit}>
              Edit Profile
            </Button>
          ) : null}
        </Box>
      </Box>

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Tabs value={tab} onChange={(_, value: ProfileTab) => setTab(value)} aria-label="Profile views" variant="scrollable" scrollButtons="auto">
              <Tab label="Overview" value="overview" />
              <Tab label="Security" value="security" />
            </Tabs>
            <Typography variant="caption" color="text.secondary">
              Live session • {user.email}
            </Typography>
          </Box>

          {tab === 'overview' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 4 }}>
                    <Avatar sx={{ bgcolor: kineticPalette.primary, width: 72, height: 72, fontSize: '1.5rem', fontWeight: 800 }}>
                      {initialsOf(user.name)}
                    </Avatar>
                    <Typography variant="h6" component="h3" fontWeight={800}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.role}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip label="Active" size="small" color="success" variant="outlined" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      Contact Details
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: 'Full name', value: user.name },
                        { label: 'Work email', value: user.email },
                        { label: 'Role', value: user.role },
                      ].map((field) => (
                        <Grid key={field.label} size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.06em' }}>
                            {field.label.toUpperCase()}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {field.value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : null}

          {tab === 'security' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Change it any time from Profile Settings — the current session is invalidated afterwards.
                    </Typography>
                  </Box>
                  <Button component={RouterLink} to="/settings/profile" variant="outlined" startIcon={<LockIcon />}>
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit profile name</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Full name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            error={Boolean(nameError)}
            helperText={nameError ?? ' '}
            fullWidth
            sx={{ mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default ProfilePage;
