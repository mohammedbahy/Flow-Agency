import { useEffect, useState } from 'react';
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
import ActivityFeed, { type ActivityItem } from '../components/ActivityFeed';
import KpiCardView from '../components/KpiCardView';
import PendingReviewsTable, { type PendingReviewRow } from '../components/PendingReviewsTable';
import TeamAllocation, { type AllocationRow } from '../components/TeamAllocation';
import WorkloadChart, { type WorkloadWeek } from '../components/WorkloadChart';
import type { KpiCard } from '../types/dashboard.types';
import { useAuth } from '../../../core/auth/AuthContext';
import { dashboardService, type DashboardAggregate } from '../../analytics/services/analytics.service';
import { tasksService, type DelayedTaskItem } from '../../tasks/services/tasks.service';
import { teamsService } from '../../teams/services/teams.service';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) return 'just now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

type DashboardTab = 'executive' | 'agency';

/** Executive dashboard screen. Live KPIs + agency overview; activity/tables stay curated preview. */
export function DashboardPage({ initialTab = 'executive' }: { initialTab?: DashboardTab } = {}) {
  const { user } = useAuth();
  const [view, setView] = useState<DashboardTab>(initialTab);
  const [escalationOpen, setEscalationOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [aggregate, setAggregate] = useState<DashboardAggregate | null>(null);
  const [delayedItems, setDelayedItems] = useState<DelayedTaskItem[]>([]);
  const [allocationRows, setAllocationRows] = useState<AllocationRow[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [workloadWeeks, setWorkloadWeeks] = useState<WorkloadWeek[]>([]);
  const previewNote = (action: string) =>
    setToast(`${action} is decorative in this UI preview — available in a future sprint.`);

  useEffect(() => {
    let cancelled = false;
    async function loadWorkspace() {
      try {
        const [agg, delayed, teamsRes, tasksRes] = await Promise.all([
          dashboardService.get(),
          tasksService.delayed({ limit: 100 }),
          teamsService.list({ limit: 100 }),
          tasksService.list({ limit: 100 }),
        ]);
        if (cancelled) return;
        setAggregate(agg);
        setDelayedItems(delayed.items);

        const totalOpenTasks = agg.tasks.total - (agg.tasks.byStatus.completed ?? 0);
        const teamTaskCounts = new Map(agg.teams.byTeam.map((t) => [t.id, t.taskCount]));
        setAllocationRows(
          teamsRes.data.map((team) => {
            const openTasks = teamTaskCounts.get(team.id) ?? 0;
            const share = totalOpenTasks > 0 ? Math.round((openTasks / totalOpenTasks) * 100) : 0;
            return {
              id: team.id,
              team: team.name,
              detail: `${team.memberCount} members · ${openTasks} open tasks`,
              percent: share,
              note: `${share}% of open load`,
              overCapacity: share >= 60 && openTasks > 0,
            };
          }),
        );

        const recent = [...tasksRes.data]
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
          .slice(0, 5);
        setActivityItems(
          recent.map((t) => ({
            id: t.id,
            actor: 'Workspace',
            text: `${t.status === 'completed' ? 'completed' : 'opened'} task “${t.title || t.taskType}”`,
            time: timeAgo(t.status === 'completed' ? t.updatedAt : t.createdAt),
          })),
        );

        const buckets = new Map<string, number>();
        for (let w = 5; w >= 0; w--) {
          const d = new Date();
          d.setDate(d.getDate() - w * 7);
          buckets.set(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 0);
        }
        const keys = [...buckets.keys()];
        for (const t of tasksRes.data) {
          const created = new Date(t.createdAt).getTime();
          if (Number.isNaN(created)) continue;
          const ageWeeks = Math.floor((Date.now() - created) / (7 * 86400000));
          if (ageWeeks >= 0 && ageWeeks < 6) {
            const key = keys[5 - ageWeeks];
            buckets.set(key, (buckets.get(key) ?? 0) + 1);
          }
        }
        setWorkloadWeeks([...buckets.entries()].map(([label, value]) => ({ label, value })));
      } catch {
        if (!cancelled) {
          setAggregate(null);
        }
      }
    }
    void loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingRows: PendingReviewRow[] = delayedItems.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title || t.taskType,
    client: t.client?.name || '—',
    lead: t.assignee?.name || 'Unassigned',
    deadline: formatDate(t.deadline),
    daysOverdue: t.daysOverdue,
  }));

  const delayedTotal = aggregate
    ? aggregate.tasks.total - (aggregate.tasks.byStatus.completed ?? 0) - (aggregate.tasks.byStatus.cancelled ?? 0)
    : delayedItems.length;

  const firstName = user?.name.split(' ')[0] ?? 'there';

  const liveKpis: KpiCard[] = [
    {
      id: 'clients',
      eyebrow: 'Active clients',
      value: String(aggregate?.clients.active ?? '—'),
      caption: `${aggregate?.clients.total ?? '—'} total client accounts`,
      stats: [{ label: `${aggregate?.clients.inactive ?? '—'} inactive`, value: '' }],
    },
    {
      id: 'tasks',
      eyebrow: 'Task completion',
      value: aggregate ? `${Math.round(aggregate.tasks.completionRate * 100)}%` : '—',
      caption: `${aggregate?.tasks.total ?? '—'} total tasks`,
      stats: [
        { label: `${aggregate?.tasks.byStatus.completed ?? '—'} completed`, value: '' },
        {
          label: `${(aggregate?.tasks.byStatus.pending ?? 0) + (aggregate?.tasks.byStatus.in_progress ?? 0)} open`,
          value: '',
        },
      ],
    },
    {
      id: 'teams',
      eyebrow: 'Teams',
      value: String(aggregate?.teams.active ?? '—'),
      caption: `${aggregate?.teams.total ?? '—'} total teams`,
      stats: [],
    },
    {
      id: 'brands',
      eyebrow: 'Brands',
      value: String(aggregate?.brands.active ?? '—'),
      caption: `${aggregate?.brands.total ?? '—'} total brands`,
      stats: [],
    },
  ];

  const agencyStats = aggregate
    ? [
        { label: 'Active clients', value: String(aggregate.clients.active), sub: `${aggregate.clients.total} accounts` },
        { label: 'Team capacity', value: String(aggregate.teams.total), sub: `${aggregate.teams.active} active teams` },
        { label: 'Completed tasks', value: String(aggregate.tasks.byStatus.completed ?? 0), sub: 'Shipped' },
        { label: 'Delayed tasks', value: String(aggregate.tasks.total - (aggregate.tasks.byStatus.completed ?? 0) - (aggregate.tasks.byStatus.cancelled ?? 0)), sub: 'Open, not completed' },
      ]
    : [];

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            EXECUTIVE WORKSPACE • <Typography component="span" variant="caption" color="success.main" fontWeight={700}>● Live Syncing</Typography>
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Good morning, {firstName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live workspace totals below. Activity, allocation and workload derive from real records.
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
                  <Typography variant="h6" component="h3" gutterBottom>Tasks by status</Typography>
                  {aggregate ? (
                    Object.entries(aggregate.tasks.byStatus).map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                        <Typography variant="body2" fontWeight={600}>{status}</Typography>
                        <Typography variant="body2" color="text.secondary">{count} tasks</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">Loading live totals…</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>Largest teams</Typography>
                  {aggregate ? (
                    [...aggregate.teams.byTeam].sort((a, b) => b.taskCount - a.taskCount).slice(0, 3).map((team) => (
                      <Box key={team.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                        <Typography variant="body2" fontWeight={600}>{team.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{team.taskCount} tasks</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">Loading live totals…</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : null}

      {view === 'executive' ? (
      <>
      <Grid container spacing={2}>
        {liveKpis.map((kpi) => (
          <Grid key={kpi.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCardView kpi={kpi} />
          </Grid>
        ))}
      </Grid>

      {escalationOpen && delayedTotal > 0 ? (
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
            {delayedTotal} Overdue Deliverable{delayedTotal === 1 ? '' : 's'} Require{delayedTotal === 1 ? 's' : ''} Intervention
          </Typography>
          <Typography variant="body2">
            {pendingRows.slice(0, 2).map((r) => r.title).join(' + ') || 'Overdue work'}
            {delayedTotal > 2 ? ` and ${delayedTotal - 2} more` : ''} breached
            {delayedTotal === 1 ? ' its' : ' their'} deadline. Reassign capacity or resolve the escalation.
          </Typography>
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" component="h3">
                  Items Needing Attention
                </Typography>
                <Chip label="Live overdue report" size="small" color="error" variant="outlined" />
              </Box>
              <PendingReviewsTable rows={pendingRows} />
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Weekly Workload
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                New tasks created per week (live records)
              </Typography>
              <WorkloadChart weeks={workloadWeeks} caption={`${workloadWeeks.reduce((s, w) => s + w.value, 0)} tasks created in the last 6 weeks`} />
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
                <Chip label="Live load" size="small" variant="outlined" />
              </Box>
              <TeamAllocation rows={allocationRows} onOpenPlanner={() => previewNote('Resource planner')} />
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Live Activity
              </Typography>
              <ActivityFeed items={activityItems} />
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
