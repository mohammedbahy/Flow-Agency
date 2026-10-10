import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, FormControl, InputLabel,
  MenuItem, Select, Switch, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import { getApiErrorMessage } from '../../../core/api/errors';
import { deadlineRulesService, type ApiDeadlineRule } from '../services/deadline-rules.service';
import { TASK_TYPE_LABEL } from '../types/settings.types';
type SettingsTab = 'general' | 'notifications' | 'security' | 'deadlines';

/** Settings screen: workspace preferences (local) + live deadline defaults. */
export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');
  const [workspaceName, setWorkspaceName] = useState('Neurteq Agency');
  const [timezone, setTimezone] = useState('Africa/Cairo');
  const [emailNotif, setEmailNotif] = useState(true);
  const [slackNotif, setSlackNotif] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);
  const [rules, setRules] = useState<ApiDeadlineRule[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  // Live deadline rules back the Deadlines tab (persisted toggles).
  useEffect(() => {
    if (tab !== 'deadlines') return;
    let cancelled = false;
    deadlineRulesService
      .list()
      .then((data) => !cancelled && setRules(data))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [tab]);

  async function handleToggleRule(rule: ApiDeadlineRule, active: boolean) {
    try {
      await deadlineRulesService.update(rule.id, { active });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active } : r)));
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    }
  }

  function handleSave() {
    setFlash('Workspace preferences are kept on this device only — deadline changes save to the backend immediately.');
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            WORKSPACE • Configuration
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Workspace identity, notification channels, and security defaults.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Changes
        </Button>
      </Box>

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Tabs value={tab} onChange={(_, value: SettingsTab) => setTab(value)} aria-label="Settings views" variant="scrollable" scrollButtons="auto">
            <Tab label="General" value="general" />
            <Tab label="Notifications" value="notifications" />
            <Tab label="Security" value="security" />
            <Tab label="Deadlines" value="deadlines" />
          </Tabs>

          {tab === 'general' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 560 }}>
              <TextField label="Workspace name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} fullWidth />
              <FormControl fullWidth>
                <InputLabel id="settings-timezone-label">Timezone</InputLabel>
                <Select labelId="settings-timezone-label" label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {['Africa/Cairo', 'Europe/London', 'America/New_York', 'Asia/Dubai'].map((tz) => (
                    <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ) : null}

          {tab === 'notifications' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: 'Email notifications', sub: 'SLA warnings and review requests by email.', value: emailNotif, set: setEmailNotif },
                { label: 'Slack channel alerts', sub: 'Post escalations to the delivery channel.', value: slackNotif, set: setSlackNotif },
                { label: 'Weekly executive report', sub: 'Every Monday with brand health and throughput.', value: weeklyReport, set: setWeeklyReport },
              ].map((row) => (
                <Card key={row.label} variant="outlined">
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="body1" fontWeight={700}>{row.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{row.sub}</Typography>
                    </Box>
                    <Switch checked={row.value} onChange={(e) => row.set(e.target.checked)} inputProps={{ 'aria-label': row.label }} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : null}

          {tab === 'security' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography variant="body1" fontWeight={700}>Require two-factor authentication</Typography>
                    <Typography variant="body2" color="text.secondary">Applies to all workspace members once backend RBAC lands.</Typography>
                  </Box>
                  <Switch checked={twoFactorRequired} onChange={(e) => setTwoFactorRequired(e.target.checked)} inputProps={{ 'aria-label': 'Require two-factor authentication' }} />
                </CardContent>
              </Card>
            </Box>
          ) : null}

          {tab === 'deadlines' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Deadline automation defaults (persisted). Full rule builder lives on the{' '}
                <RouterLink to="/settings/deadline-rules">Deadline Rules page</RouterLink>.
              </Typography>
              {rules.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No deadline rules yet.
                </Typography>
              ) : null}
              {rules.map((rule) => (
                <Card key={rule.id} variant="outlined">
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <ScheduleIcon color="action" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={700}>{TASK_TYPE_LABEL[rule.taskType] ?? rule.taskType}</Typography>
                        <Typography variant="body2" color="text.secondary">{rule.offsetValue} {rule.offsetUnit} {rule.direction}</Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={rule.active}
                      onChange={(e) => void handleToggleRule(rule, e.target.checked)}
                      inputProps={{ 'aria-label': `${rule.taskType} rule enabled` }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default SettingsPage;
