import { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, FormControl, InputLabel,
  MenuItem, Select, Switch, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PageContainer from '../../../shared/components/PageContainer';
import { MOCK_DEADLINE_RULES } from '../../deadlines/mock/deadlines.mock';

type SettingsTab = 'general' | 'notifications' | 'security' | 'deadlines';

/** Settings screen: workspace preferences with tabs — all local mock state. */
export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');
  const [workspaceName, setWorkspaceName] = useState('Neurteq Agency');
  const [timezone, setTimezone] = useState('Africa/Cairo');
  const [emailNotif, setEmailNotif] = useState(true);
  const [slackNotif, setSlackNotif] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);
  const [deadlineEnabled, setDeadlineEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_DEADLINE_RULES.map((r) => [r.id, r.enabled])),
  );
  const [flash, setFlash] = useState<string | null>(null);

  function handleSave() {
    setFlash('Settings saved (local preview — not saved).');
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
                Deadline automation defaults. Full rule builder lives on the Deadline Rules page.
              </Typography>
              {MOCK_DEADLINE_RULES.map((rule) => (
                <Card key={rule.id} variant="outlined">
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <ScheduleIcon color="action" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={700}>{rule.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{rule.threshold} • {rule.action}</Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={deadlineEnabled[rule.id] ?? rule.enabled}
                      onChange={(e) => setDeadlineEnabled((prev) => ({ ...prev, [rule.id]: e.target.checked }))}
                      inputProps={{ 'aria-label': `${rule.name} enabled` }}
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
