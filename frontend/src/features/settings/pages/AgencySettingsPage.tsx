import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  TextField,
} from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import { agencySettingsService } from '../services/agency-settings.service';
import { validateAgencySettings, type AgencySettingsErrors } from '../types/settings.types';

interface AgencyForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

/** Agency Settings screen — live singleton (`GET/PATCH /api/v1/agency-settings`). */
export function AgencySettingsPage() {
  const { isAdmin } = useAuth();
  const [values, setValues] = useState<AgencyForm>({ name: '', email: '', phone: '', address: '' });
  const [baseline, setBaseline] = useState<AgencyForm>({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<AgencySettingsErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await agencySettingsService.get();
      const form = {
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
      };
      setValues(form);
      setBaseline(form);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof AgencyForm>(key: K, value: AgencyForm[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const nextErrors = validateAgencySettings(values);
    setErrors(nextErrors);
    setSaveError(null);
    if (nextErrors.name ?? nextErrors.email) return;
    setSaving(true);
    try {
      const updated = await agencySettingsService.update({
        name: values.name.trim(),
        email: values.email.trim() || undefined,
        phone: values.phone.trim() || undefined,
        address: values.address.trim() || undefined,
      });
      const form = {
        name: updated.name ?? '',
        email: updated.email ?? '',
        phone: updated.phone ?? '',
        address: updated.address ?? '',
      };
      setValues(form);
      setBaseline(form);
      setSaved(true);
    } catch (error) {
      setSaveError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings • Workspace"
        title="Agency Settings"
        subtitle="Workspace identity and contact details. Changes persist to the backend."
        actions={
          <>
            <Button color="inherit" onClick={() => { setValues(baseline); setErrors({}); }} disabled={!dirty}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => void handleSave()} disabled={!dirty || saving || !isAdmin}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      />

      {!isAdmin ? (
        <Alert severity="info" role="status">
          Only administrators can change agency settings.
        </Alert>
      ) : null}

      {saveError ? (
        <Alert severity="error" role="alert" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading agency settings">
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800 }} aria-hidden>
                    {values.name.trim().slice(0, 1).toUpperCase() || 'A'}
                  </Avatar>
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
                  disabled={!isAdmin}
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
                      disabled={!isAdmin}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="agency-phone"
                      label="Contact phone"
                      value={values.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      fullWidth
                      disabled={!isAdmin}
                    />
                  </Grid>
                </Grid>
                <TextField
                  id="agency-address"
                  label="Address"
                  value={values.address}
                  onChange={(e) => set('address', e.target.value)}
                  fullWidth
                  disabled={!isAdmin}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar open={saved} autoHideDuration={3500} onClose={() => setSaved(false)} message="Agency settings saved successfully." />
    </PageContainer>
  );
}

export default AgencySettingsPage;
