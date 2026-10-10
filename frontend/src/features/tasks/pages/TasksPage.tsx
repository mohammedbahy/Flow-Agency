import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, LinearProgress,
  Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography,
} from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { getApiErrorMessage } from '../../../core/api/errors';
import { tasksService } from '../services/tasks.service';
import { usersService } from '../../users/services/users.service';

export type TasksTab = 'completed' | 'delayed' | 'rate';

interface LiveRow {
  id: string;
  title: string;
  detail: string;
  assignee: string;
  due: string;
  delayed: boolean;
}

/** Tasks workspace: live completed, delayed, and completion-rate tabs. */
export function TasksPage({ initialTab = 'completed' }: { initialTab?: TasksTab } = {}) {
  const [tab, setTab] = useState<TasksTab>(initialTab);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [completedRes, delayedRes, rateRes, usersRes] = await Promise.all([
        tasksService.list({ status: 'completed', limit: 100 }),
        tasksService.delayed({ limit: 100 }),
        tasksService.completionRate(),
        usersService.list({ limit: 100 }),
      ]);
      const userNames = new Map(usersRes.data.map((u) => [u.id, u.name]));
      const completedRows: LiveRow[] = completedRes.data.map((t) => ({
        id: t.id,
        title: t.title || t.taskType,
        detail: t.taskType,
        assignee: (t.assignee && userNames.get(t.assignee)) || 'Unassigned',
        due: t.deadline ? new Date(t.deadline).toLocaleDateString() : '—',
        delayed: false,
      }));
      const delayedRows: LiveRow[] = delayedRes.items.map((t) => ({
        id: t.id,
        title: t.title || t.taskType,
        detail: `${t.taskType} · ${t.daysOverdue}d overdue`,
        assignee: t.assignee?.name || 'Unassigned',
        due: new Date(t.deadline).toLocaleDateString(),
        delayed: true,
      }));
      setRows([...completedRows, ...delayedRows]);
      setRate(Math.round(rateRes.rate * 100));
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const q = query.trim().toLowerCase();
  const searched = useMemo(
    () =>
      rows.filter(
        (t) =>
          q.length === 0 ||
          t.title.toLowerCase().includes(q) ||
          t.detail.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q),
      ),
    [rows, q],
  );
  const completed = searched.filter((t) => !t.delayed);
  const delayed = searched.filter((t) => t.delayed);

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            DELIVERY • Task Tracking
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completed work, overdue items, and completion rate in one workspace. Live data from the backend.
          </Typography>
        </Box>
        <Chip label={`Completion ${rate}% • ${delayed.length} delayed`} color={delayed.length > 0 ? 'warning' : 'success'} variant="outlined" />
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Tabs value={tab} onChange={(_, value: TasksTab) => setTab(value)} aria-label="Task views" variant="scrollable" scrollButtons="auto">
              <Tab label={`Completed ${completed.length}`} value="completed" />
              <Tab label={`Delayed ${delayed.length}`} value="delayed" />
              <Tab label="Completion Rate" value="rate" />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2, mb: 2, maxWidth: 420 }}>
            <SearchField label="Search tasks" placeholder="Search tasks, projects, or assignees" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading tasks">
              <CircularProgress />
            </Box>
          ) : loadError ? (
            <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
              {loadError}
            </Alert>
          ) : (
            <>
              {tab === 'completed' ? (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table aria-label="Completed tasks">
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Due</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {completed.map((task) => (
                        <TableRow key={task.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>{task.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{task.detail}</Typography>
                          </TableCell>
                          <TableCell>{task.assignee}</TableCell>
                          <TableCell>{task.due}</TableCell>
                          <TableCell><Chip label="Completed" size="small" color="success" variant="outlined" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}

              {tab === 'delayed' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Alert severity="warning" role="status">
                    Escalation rule active: tasks 4h overdue notify the Agency Director (local preview).
                  </Alert>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table aria-label="Delayed tasks">
                      <TableHead>
                        <TableRow>
                          <TableCell>Task</TableCell>
                          <TableCell>Assignee</TableCell>
                          <TableCell>Due</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {delayed.map((task) => (
                          <TableRow key={task.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700}>{task.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{task.detail}</Typography>
                            </TableCell>
                            <TableCell>{task.assignee}</TableCell>
                            <TableCell>{task.due}</TableCell>
                            <TableCell><Chip label="Delayed" size="small" color="error" variant="outlined" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : null}

              {tab === 'rate' ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body1" fontWeight={700}>Workspace completion rate</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {completed.length} completed • {delayed.length} delayed
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={rate} sx={{ flexGrow: 1 }} aria-label={`Workspace completion ${rate}%`} />
                          <Typography variant="caption">{rate}%</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default TasksPage;
