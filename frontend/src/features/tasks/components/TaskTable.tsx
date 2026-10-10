import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import StatusChip from '../../../shared/components/StatusChip';
import type { TaskRow } from '../types/tasks.types';

type SortKey = 'title' | 'due';
type Direction = 'asc' | 'desc';

function assigneeInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

interface TaskTableProps {
  tasks: TaskRow[];
  variant: 'delayed' | 'completed';
  emptyMessage: string;
}

/** Shared task table with title/due-date sorting and status-aware date column. */
export function TaskTable({ tasks, variant, emptyMessage }: TaskTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('due');
  const [direction, setDirection] = useState<Direction>('asc');

  const sorted = useMemo(() => {
    const dir = direction === 'asc' ? 1 : -1;
    return [...tasks].sort((a, b) => {
      if (sortKey === 'title') return a.title.localeCompare(b.title) * dir;
      return a.dueDate.localeCompare(b.dueDate) * dir;
    });
  }, [tasks, sortKey, direction]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  }

  if (sorted.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table aria-label={variant === 'delayed' ? 'Delayed tasks' : 'Completed tasks'}>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortKey === 'title' ? direction : false}>
              <TableSortLabel
                active={sortKey === 'title'}
                direction={sortKey === 'title' ? direction : 'asc'}
                onClick={() => toggleSort('title')}
              >
                Task
              </TableSortLabel>
            </TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell sortDirection={sortKey === 'due' ? direction : false}>
              <TableSortLabel
                active={sortKey === 'due'}
                direction={sortKey === 'due' ? direction : 'asc'}
                onClick={() => toggleSort('due')}
              >
                {variant === 'delayed' ? 'Due' : 'Completed'}
              </TableSortLabel>
            </TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((task) => (
            <TableRow key={task.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={700}>
                  {task.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.taskType}
                </Typography>
              </TableCell>
              <TableCell>{task.client}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem' }} aria-hidden>
                    {assigneeInitials(task.assignee)}
                  </Avatar>
                  <Typography variant="body2" noWrap>
                    {task.assignee}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                {variant === 'delayed' ? (
                  <Box>
                    <Typography variant="body2" noWrap>
                      {task.dueDate}
                    </Typography>
                    <Typography variant="caption" color="error.main" fontWeight={700}>
                      {task.daysOverdue} day{task.daysOverdue === 1 ? '' : 's'} overdue
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" noWrap>
                    {task.completedDate}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {variant === 'delayed' ? (
                  <StatusChip label="Delayed" tone="error" />
                ) : (
                  <StatusChip label="Completed" tone="success" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TaskTable;
