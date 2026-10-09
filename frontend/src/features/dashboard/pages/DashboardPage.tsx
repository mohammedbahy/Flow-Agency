import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import PageContainer from '../../../shared/components/PageContainer';
import ActivityFeed from '../components/ActivityFeed';
import KpiCardView from '../components/KpiCardView';
import PendingReviewsTable from '../components/PendingReviewsTable';
import TeamAllocation from '../components/TeamAllocation';
import WorkloadChart from '../components/WorkloadChart';
import {
  MOCK_ACTIVITY,
  MOCK_ALLOCATION,
  MOCK_KPIS,
  MOCK_PENDING_REVIEWS,
  MOCK_WORKLOAD,
} from '../mock/dashboard.mock';
import { DEMO_USER } from '../../../shared/components/workspace';

/** Executive dashboard screen. KPI cards, escalation banner, reviews, allocation, activity, workload — all mock data. */
export function DashboardPage() {
  const [escalationOpen, setEscalationOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const previewNote = (action: string) =>
    setToast(`${action} is decorative in this UI preview — available in a future sprint.`);

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            EXECUTIVE WORKSPACE • <Typography component="span" variant="caption" color="success.main" fontWeight={700}>● Live Syncing</Typography>
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Good morning, {DEMO_USER.name.split(' ')[0]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here is what requires your attention across 28 active client accounts today. 2 items are flagged for
            intervention.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip icon={<CalendarMonthIcon />} label="Last 7 Days (Oct 14 – Oct 20)" variant="outlined" />
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => previewNote('Weekly report export')}>
            Export Weekly Report
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => previewNote('New content plan')}>
            New Content Plan
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => previewNote('Task creation')}>
            Create Task
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {MOCK_KPIS.map((kpi) => (
          <Grid key={kpi.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCardView kpi={kpi} />
          </Grid>
        ))}
      </Grid>

      {escalationOpen ? (
        <Alert
          severity="error"
          icon={<WarningIcon />}
          onClose={() => setEscalationOpen(false)}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" size="small" variant="outlined" onClick={() => previewNote('Load reassignment')}>
                Reassign Load
              </Button>
              <Button color="inherit" size="small" variant="outlined" onClick={() => setEscalationOpen(false)}>
                Resolve Escalation
              </Button>
            </Box>
          }
        >
          <Typography variant="body2" fontWeight={700}>
            2 Overdue Deliverables Require Intervention
          </Typography>
          <Typography variant="body2">
            Apex Performance Creative Set + TikTok SLA breached. Reassign capacity or resolve the escalation to restore
            the on-time rate.
          </Typography>
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" component="h3">
                  Pending Client Reviews & Approvals
                </Typography>
                <Chip label="Auto-reminders active" size="small" color="success" variant="outlined" />
              </Box>
              <PendingReviewsTable rows={MOCK_PENDING_REVIEWS} />
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Weekly Workload & Output Breakdown
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Planned vs delivered output across operational pillars
              </Typography>
              <WorkloadChart weeks={MOCK_WORKLOAD} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h6" component="h3">
                  Team Allocation
                </Typography>
                <Chip label="Weekly SLA" size="small" variant="outlined" />
              </Box>
              <TeamAllocation rows={MOCK_ALLOCATION} onOpenPlanner={() => previewNote('Resource planner')} />
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Live Activity
              </Typography>
              <ActivityFeed items={MOCK_ACTIVITY} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={toast !== null} autoHideDuration={3500} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default DashboardPage;
