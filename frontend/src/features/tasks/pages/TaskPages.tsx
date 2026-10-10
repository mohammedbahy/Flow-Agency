import { useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import SearchField from '../../../shared/components/SearchField';
import TaskTable from '../components/TaskTable';
import { MOCK_TASKS } from '../mock/tasks.mock';
import { TASK_PRIORITY_LABEL, type TaskPriority } from '../types/tasks.types';

function useTaskFilters(status: 'delayed' | 'completed') {
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<'all' | TaskPriority>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_TASKS.filter(
      (t) =>
        t.status === status &&
        (priority === 'all' || t.priority === priority) &&
        (q.length === 0 ||
          t.title.toLowerCase().includes(q) ||
          t.client.toLowerCase().includes(q) ||
          t.assignee.toLowerCase().includes(q)),
    );
  }, [query, priority, status]);

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
        <InputLabel id={`${status}-priority-label`}>Priority</InputLabel>
        <Select
          labelId={`${status}-priority-label`}
          id={`${status}-priority`}
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'all' | TaskPriority)}
        >
          <MenuItem value="all">All priorities</MenuItem>
          {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => (
            <MenuItem key={p} value={p}>
              {TASK_PRIORITY_LABEL[p]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );

  return { filtered, controls };
}

/** Delayed tasks screen: overdue work with assignees and priorities. Mock data only. */
export function DelayedTasksPage() {
  const { filtered, controls } = useTaskFilters('delayed');
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Delivery • Attention needed"
        title="Delayed Tasks"
        subtitle={`${filtered.length} overdue tasks across active client accounts. Figures are static preview data.`}
      />
      <Alert severity="warning" role="status">
        Escalation rule active: tasks overdue by 4h notify the Agency Director (local preview).
      </Alert>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>{controls}</Box>
          <TaskTable tasks={filtered} variant="delayed" emptyMessage="Nothing overdue — every task is on schedule." />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

/** Completed tasks screen: finished work with completion dates. Mock data only. */
export function CompletedTasksPage() {
  const { filtered, controls } = useTaskFilters('completed');
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Delivery • Shipped work"
        title="Completed Tasks"
        subtitle={`${filtered.length} completed tasks. Figures are static preview data.`}
      />
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>{controls}</Box>
          <TaskTable tasks={filtered} variant="completed" emptyMessage="No completed tasks match your filters." />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
