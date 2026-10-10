import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import { MOCK_AGENCY_SETTINGS, TIMEZONES } from '../mock/settings.mock';
import { validateAgencySettings, type AgencySettingsErrors } from '../types/settings.types';

/** Agency Settings screen: workspace identity, contact, preferences. Mock save only. */
export function AgencySettingsPage() {
  const [values, setValues] = useState(MOCK_AGENCY_SETTINGS);
  const [errors, setErrors] = useState<AgencySettingsErrors>({});
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(MOCK_AGENCY_SETTINGS);

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    const nextErrors = validateAgencySettings(values);
    setErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.email) return;
    // Mock save — backend persists these fields in a later sprint.
    setSaved(true);
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings • Workspace"
        title="Agency Settings"
        subtitle="Workspace identity, contact details and preferences. Saving updates the local preview only."
        actions={
          <>
            <Button color="inherit" onClick={() => { setValues(MOCK_AGENCY_SETTINGS); setErrors({}); }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={!dirty}>
              Save changes
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800 }} aria-hidden>
                  {values.name.trim().slice(0, 1).toUpperCase() || 'A'}
                </Avatar>
                <Button variant="outlined" size="small" onClick={() => setSaved(true)}>
                  Upload logo
                </Button>
              </Box>
              <TextField
                id="agency-name"
                label="Agency name"
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name ?? ' '}
                fullWidth
                required
              />
              <TextField
                id="agency-tagline"
                label="Tagline"
                value={values.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                fullWidth
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="agency-email"
                    label="Contact email"
                    type="email"
                    value={values.email}
                    onChange={(e) => set('email', e.target.value)}
                    error={Boolean(errors.email)}
                    helperText={errors.email ?? ' '}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="agency-phone"
                    label="Contact phone"
                    value={values.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <TextField
                id="agency-address"
                label="Address"
                value={values.address}
                onChange={(e) => set('address', e.target.value)}
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="agency-timezone-label">Timezone</InputLabel>
                <Select
                  labelId="agency-timezone-label"
                  id="agency-timezone"
                  label="Timezone"
                  value={values.timezone}
                  onChange={(e) => set('timezone', e.target.value)}
                >
                  {TIMEZONES.map((tz) => (
                    <MenuItem key={tz} value={tz}>
                      {tz}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {dirty ? (
                <Alert severity="info" role="status">
                  You have unsaved changes.
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={saved} autoHideDuration={3500} onClose={() => setSaved(false)} message="Settings saved in local preview — nothing was sent to a backend." />
    </PageContainer>
  );
}

export default AgencySettingsPage;
