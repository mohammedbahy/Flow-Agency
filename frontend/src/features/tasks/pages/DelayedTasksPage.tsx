import { useState } from 'react';
import { Alert, Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { MOCK_TASK_ROWS } from '../mock/tasks.mock';

/** Delayed Tasks: overdue rows with escalation note — all local mock state. */
export function DelayedTasksPage() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = MOCK_TASK_ROWS.filter((t) => t.status === 'delayed').filter(
    (t) => q.length === 0 || t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q),
  );

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            DELIVERY RISKS • Overdue
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Delayed Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tasks past their due date that need reassignment or escalation.
          </Typography>
        </Box>
        <Chip label={`${rows.length} delayed`} color="error" variant="outlined" />
      </Box>
      <Alert severity="warning" role="status">
        Escalation rule active: tasks 4h overdue notify the Agency Director (local preview).
      </Alert>
      <Card>
        <CardContent>
          <Box sx={{ maxWidth: 420, mb: 2 }}>
            <SearchField label="Search delayed tasks" placeholder="Search tasks or assignees" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          </Box>
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
                {rows.map((task) => (
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
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default DelayedTasksPage;
