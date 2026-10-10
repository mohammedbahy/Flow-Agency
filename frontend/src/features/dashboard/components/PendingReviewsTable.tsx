import { Avatar, Box, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import StatusChip from '../../../shared/components/StatusChip';

export interface PendingReviewRow {
  id: string;
  title: string;
  client: string;
  lead: string;
  deadline: string;
  daysOverdue: number;
}

/** Overdue items table (live delayed-tasks report) with a link to Reviews. */
export function PendingReviewsTable({ rows }: { rows: PendingReviewRow[] }) {
  return (
    <Box>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Nothing overdue — every task is on schedule.
        </Typography>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table aria-label="Items needing attention">
            <TableHead>
              <TableRow>
                <TableCell>Client & Deliverable</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>SLA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar sx={{ width: 34, height: 34, fontSize: '0.75rem', fontWeight: 700 }} aria-hidden>
                        {row.client.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.client}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.lead}</TableCell>
                  <TableCell>{row.deadline}</TableCell>
                  <TableCell>
                    <StatusChip label={`${row.daysOverdue}d overdue`} tone="error" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {rows.length} overdue item{rows.length === 1 ? '' : 's'}
        </Typography>
        <Link component={RouterLink} to="/reviews" underline="hover" fontWeight={600} fontSize="0.875rem">
          View full approval queue →
        </Link>
      </Box>
    </Box>
  );
}

export default PendingReviewsTable;
