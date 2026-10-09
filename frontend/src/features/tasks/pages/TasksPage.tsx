import { useState } from 'react';
import {
  Alert, Box, Card, CardContent, Chip, Grid, LinearProgress,
  Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography,
} from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { MOCK_TASK_ROWS } from '../mock/tasks.mock';

export type TasksTab = 'completed' | 'delayed' | 'rate';

/** Tasks workspace: completed, delayed, and completion-rate tabs — all local mock state. */
export function TasksPage({ initialTab = 'completed' }: { initialTab?: TasksTab } = {}) {
  const [tab, setTab] = useState<TasksTab>(initialTab);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const searched = MOCK_TASK_ROWS.filter(
    (t) => q.length === 0 || t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q),
  );
  const completed = searched.filter((t) => t.status === 'completed');
  const delayed = searched.filter((t) => t.status === 'delayed');
  const avg = Math.round(searched.reduce((s, t) => s + t.completion, 0) / Math.max(searched.length, 1));

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
            Completed work, overdue items, and completion rate in one workspace.
          </Typography>
        </Box>
        <Chip label={`Average ${avg}% • ${delayed.length} delayed`} color={delayed.length > 0 ? 'warning' : 'success'} variant="outlined" />
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

          {tab === 'completed' ? (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table aria-label="Completed tasks">
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completed.map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={700}>{task.title}</Typography></TableCell>
                      <TableCell>{task.project}</TableCell>
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
                      <TableCell>Project</TableCell>
                      <TableCell>Assignee</TableCell>
                      <TableCell>Due</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {delayed.map((task) => (
                      <TableRow key={task.id} hover>
                        <TableCell><Typography variant="body2" fontWeight={700}>{task.title}</Typography></TableCell>
                        <TableCell>{task.project}</TableCell>
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
              {searched.map((task) => (
                <Grid key={task.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body1" fontWeight={700}>{task.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{task.project} • {task.assignee}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={task.completion} sx={{ flexGrow: 1 }} aria-label={`${task.title} ${task.completion}%`} />
                        <Typography variant="caption">{task.completion}%</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default TasksPage;
