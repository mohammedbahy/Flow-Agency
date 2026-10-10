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
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import PageContainer from '../../../shared/components/PageContainer';
import { kineticPalette } from '../../../core/theme/tokens';
import { MOCK_PROFILE, MOCK_PROFILE_ACTIVITY } from '../mock/profile.mock';
import type { MockProfile } from '../types/profile.types';

type ProfileTab = 'overview' | 'activity' | 'security';

/** Profile screen: overview header, details card, activity + security tabs — all local mock state. */
export function ProfilePage() {
  const [profile, setProfile] = useState<MockProfile>(MOCK_PROFILE);
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<MockProfile>(MOCK_PROFILE);
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const previewNote = (action: string) =>
    setToast(`${action} is decorative in this UI preview — available in a future sprint.`);

  function openEdit() {
    setDraft(profile);
    setEditOpen(true);
  }

  function handleSave() {
    setProfile(draft);
    setEditOpen(false);
    setFlash(`${draft.name} updated (local preview — not saved).`);
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
            View and manage your workspace identity, contact details, and security preferences.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<LockIcon />} onClick={() => previewNote('Password change')}>
            Change Password
          </Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={openEdit}>
            Edit Profile
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Tabs value={tab} onChange={(_, value: ProfileTab) => setTab(value)} aria-label="Profile views" variant="scrollable" scrollButtons="auto">
              <Tab label="Overview" value="overview" />
              <Tab label={`Activity ${MOCK_PROFILE_ACTIVITY.length}`} value="activity" />
              <Tab label="Security" value="security" />
            </Tabs>
            <Typography variant="caption" color="text.secondary">
              Sync: Realtime • Demo workspace
            </Typography>
          </Box>

          {tab === 'overview' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Card variant="outlined">
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 4 }}>
                    <Avatar sx={{ bgcolor: kineticPalette.primary, width: 72, height: 72, fontSize: '1.5rem', fontWeight: 800 }}>
                      {profile.initials}
                    </Avatar>
                    <Typography variant="h6" component="h3" fontWeight={800}>
                      {profile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile.role} • {profile.team}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip label="Active" size="small" color="success" variant="outlined" />
                      {profile.twoFactor ? (
                        <Chip icon={<ShieldIcon />} label="2FA Enabled" size="small" color="success" variant="outlined" />
                      ) : (
                        <Chip label="2FA Off" size="small" variant="outlined" />
                      )}
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
                        { label: 'Full name', value: profile.name },
                        { label: 'Work email', value: profile.email },
                        { label: 'Role', value: profile.role },
                        { label: 'Team', value: profile.team },
                        { label: 'Phone', value: profile.phone },
                        { label: 'Location', value: profile.location },
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

          {tab === 'activity' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {MOCK_PROFILE_ACTIVITY.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="body1" fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.detail} • {item.time}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : null}

          {tab === 'security' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      Two-factor authentication
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile.twoFactor ? 'Enabled for this workspace account.' : 'Disabled — enable it in a future sprint.'}
                    </Typography>
                  </Box>
                  <Chip icon={<ShieldIcon />} label={profile.twoFactor ? 'Enabled' : 'Disabled'} color={profile.twoFactor ? 'success' : 'default'} variant="outlined" />
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last changed 28 days ago (local preview).
                    </Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<LockIcon />} onClick={() => previewNote('Password change')}>
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit profile (local preview)</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} fullWidth />
          <TextField label="Work email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} fullWidth />
          <TextField label="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} fullWidth />
          <TextField label="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast !== null} autoHideDuration={3500} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default ProfilePage;
