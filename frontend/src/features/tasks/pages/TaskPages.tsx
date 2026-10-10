import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import SearchField from '../../../shared/components/SearchField';
import { getApiErrorMessage } from '../../../core/api/errors';
import TaskTable from '../components/TaskTable';
import { tasksService } from '../services/tasks.service';
import { usersService } from '../../users/services/users.service';
import { clientsService } from '../../clients/services/clients.service';
import { BACKEND_TASK_TYPES, type TaskRow } from '../types/tasks.types';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

function useLiveTasks(status: 'delayed' | 'completed') {
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [taskType, setTaskType] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (status === 'delayed') {
        const { items } = await tasksService.delayed({ limit: 100 });
        setRows(
          items.map((t) => ({
            id: t.id,
            title: t.title || t.taskType,
            taskType: t.taskType,
            client: t.client?.name || '—',
            assignee: t.assignee?.name || 'Unassigned',
            dueDate: formatDate(t.deadline),
            daysOverdue: t.daysOverdue,
            status: 'delayed' as const,
          })),
        );
      } else {
        const [{ data }, usersRes, clientsRes] = await Promise.all([
          tasksService.list({ status: 'completed', limit: 100 }),
          usersService.list({ limit: 100 }),
          clientsService.list({ limit: 100 }).catch(() => ({ data: [] as never[] })),
        ]);
        const userNames = new Map(usersRes.data.map((u) => [u.id, u.name]));
        const clientNames = new Map(clientsRes.data.map((c) => [c.id, c.name]));
        setRows(
          data.map((t) => ({
            id: t.id,
            title: t.title || t.taskType,
            taskType: t.taskType,
            client: (t.client && clientNames.get(t.client)) || '—',
            assignee: (t.assignee && userNames.get(t.assignee)) || 'Unassigned',
            dueDate: formatDate(t.deadline),
            completedDate: formatDate(t.updatedAt),
            status: 'completed' as const,
          })),
        );
      }
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (t) =>
        (taskType === 'all' || t.taskType === taskType) &&
        (q.length === 0 ||
          t.title.toLowerCase().includes(q) ||
          t.client.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)),
    );
  }, [rows, query, taskType]);

  const controls = (
    <>
      <Box sx={{ flexGrow: 2, minWidth: 220 }}>
        <SearchField
          label="Search tasks"
          placeholder="Search by title, client or assignee"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
      </Box>
      <FormControl size="medium" sx={{ minWidth: 150 }}>
        <InputLabel id={`${status}-type-label`}>Task type</InputLabel>
        <Select labelId={`${status}-type-label`} id={`${status}-type`} label="Task type" value={taskType} onChange={(e) => setTaskType(e.target.value)}>
          <MenuItem value="all">All types</MenuItem>
          {BACKEND_TASK_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );

  return { filtered, controls, loading, loadError, reload: load };
}

/** Delayed tasks screen — live overdue report (`GET /api/v1/reports/delayed-tasks`). */
export function DelayedTasksPage() {
  const { filtered, controls, loading, loadError, reload } = useLiveTasks('delayed');
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Delivery • Attention needed"
        title="Delayed Tasks"
        subtitle={`${filtered.length} overdue tasks · live data from the backend.`}
      />
      <Alert severity="warning" role="status">
        Escalation rule active: tasks overdue by 4h notify the Agency Director (local preview).
      </Alert>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>{controls}</Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading delayed tasks">
              <CircularProgress />
            </Box>
          ) : loadError ? (
            <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void reload()}>Retry</Button>}>
              {loadError}
            </Alert>
          ) : (
            <TaskTable tasks={filtered} variant="delayed" emptyMessage="Nothing overdue — every task is on schedule." />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

/** Completed tasks screen — live finished work (`GET /api/v1/tasks?status=completed`). */
export function CompletedTasksPage() {
  const { filtered, controls, loading, loadError, reload } = useLiveTasks('completed');
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Delivery • Shipped work"
        title="Completed Tasks"
        subtitle={`${filtered.length} completed tasks · live data from the backend.`}
      />
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>{controls}</Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading completed tasks">
              <CircularProgress />
            </Box>
          ) : loadError ? (
            <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void reload()}>Retry</Button>}>
              {loadError}
            </Alert>
          ) : (
            <TaskTable tasks={filtered} variant="completed" emptyMessage="No completed tasks match your filters." />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
