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
  Tab,
  Tabs,
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
import { MOCK_BRANDS } from '../../brand-performance/mock/brand.mock';
import { MOCK_TEAMS } from '../../teams/mock/teams.mock';
import { MOCK_TASK_ROWS } from '../../tasks/mock/tasks.mock';

type DashboardTab = 'executive' | 'agency';

/** Executive dashboard screen. KPI cards, escalation banner, reviews, allocation, activity, workload — all mock data. */
export function DashboardPage({ initialTab = 'executive' }: { initialTab?: DashboardTab } = {}) {
  const [view, setView] = useState<DashboardTab>(initialTab);
  const [escalationOpen, setEscalationOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const previewNote = (action: string) =>
    setToast(`${action} is decorative in this UI preview — available in a future sprint.`);

  const completed = MOCK_TASK_ROWS.filter((t) => t.status === 'completed').length;
  const delayed = MOCK_TASK_ROWS.filter((t) => t.status === 'delayed').length;
  const totalMembers = MOCK_TEAMS.reduce((s, t) => s + t.members, 0);
  const agencyStats = [
    { label: 'Active brands', value: String(MOCK_BRANDS.length), sub: 'Retainers in scope' },
    { label: 'Team members', value: String(totalMembers), sub: `${MOCK_TEAMS.length} delivery teams` },
    { label: 'Completed tasks', value: String(completed), sub: 'Shipped in preview' },
    { label: 'Delayed tasks', value: String(delayed), sub: 'Need intervention' },
  ];

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

      <Tabs value={view} onChange={(_, value: DashboardTab) => setView(value)} aria-label="Dashboard views" variant="scrollable" scrollButtons="auto">
        <Tab label="Executive" value="executive" />
        <Tab label="Agency Overview" value="agency" />
      </Tabs>

      {view === 'agency' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h5" component="h3" fontWeight={800}>
            Agency Overview
          </Typography>
          <Grid container spacing={2}>
            {agencyStats.map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.06em' }}>
                      {stat.label.toUpperCase()}
                    </Typography>
                    <Typography variant="h4" component="p" fontWeight={800}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{stat.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>Top brands by health</Typography>
                  {MOCK_BRANDS.slice(0, 3).map((brand) => (
                    <Box key={brand.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                      <Typography variant="body2" fontWeight={600}>{brand.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{brand.health}% • {brand.onTime} on-time</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>Largest teams</Typography>
                  {[...MOCK_TEAMS].sort((a, b) => b.members - a.members).slice(0, 3).map((team) => (
                    <Box key={team.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                      <Typography variant="body2" fontWeight={600}>{team.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{team.members} members • {team.activeProjects} projects</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : null}

      {view === 'executive' ? (
      <>
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
      </>
      ) : null}

      <Snackbar open={toast !== null} autoHideDuration={3500} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default DashboardPage;
