import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PageContainer from '../../../shared/components/PageContainer';
import { MOCK_DEADLINE_RULES } from '../mock/deadlines.mock';
import type { DeadlineTab, MockDeadlineRule } from '../types/deadlines.types';

/** Deadline Rules screen: rule list with enable toggles + local create dialog — all local mock state. */
export function DeadlineRulesPage() {
  const [tab, setTab] = useState<DeadlineTab>('rules');
  const [rules, setRules] = useState<MockDeadlineRule[]>(MOCK_DEADLINE_RULES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const enabledCount = rules.filter((r) => r.enabled).length;

  function handleToggle(id: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    const rule = rules.find((r) => r.id === id);
    if (rule) setFlash(`${rule.name} ${rule.enabled ? 'disabled' : 'enabled'} (local preview — not saved).`);
  }

  function handleCreate() {
    if (!name.trim() || !threshold.trim()) {
      setToast('Name and threshold are required in this preview.');
      return;
    }
    const created: MockDeadlineRule = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      scope: 'All client projects',
      threshold: threshold.trim(),
      action: 'Notify assignee',
      enabled: true,
      updated: 'Just now',
    };
    setRules((prev) => [created, ...prev]);
    setFlash(`${created.name} created (local preview — not saved).`);
    setName('');
    setThreshold('');
    setDialogOpen(false);
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            DELIVERY GOVERNANCE • Automation
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Deadline Rules
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define when the workspace warns, reminds, and escalates before work misses its deadline.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New Rule
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
            <Tabs value={tab} onChange={(_, value: DeadlineTab) => setTab(value)} aria-label="Deadline views" variant="scrollable" scrollButtons="auto">
              <Tab label={`Rules ${rules.length}`} value="rules" />
              <Tab label="Escalations" value="escalations" />
            </Tabs>
            <Typography variant="caption" color="text.secondary">
              Sync: Realtime • {enabledCount} of {rules.length} rules enabled
            </Typography>
          </Box>

          {tab === 'rules' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {rules.map((rule) => (
                <Card key={rule.id} variant="outlined">
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 0 }}>
                      <ScheduleIcon color="action" sx={{ mt: 0.5 }} />
                      <Box>
                        <Typography variant="body1" fontWeight={700}>
                          {rule.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rule.scope} • {rule.threshold} • {rule.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Updated {rule.updated}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={rule.enabled ? 'Enabled' : 'Disabled'} size="small" color={rule.enabled ? 'success' : 'default'} variant="outlined" />
                      <Switch checked={rule.enabled} onChange={() => handleToggle(rule.id)} inputProps={{ 'aria-label': `${rule.name} enabled` }} />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : null}

          {tab === 'escalations' ? (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" role="status">
                2 overdue deliverables currently escalated. Escalation actions run automatically once backend automation lands.
              </Alert>
            </Box>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New deadline rule (local preview)</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Rule name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required sx={{ mt: 0.5 }} />
          <TextField label="Threshold (e.g. 24h before due date)" value={threshold} onChange={(e) => setThreshold(e.target.value)} fullWidth required />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained">
            Create rule
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast !== null} autoHideDuration={3500} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default DeadlineRulesPage;
