import { Avatar, Box, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import type { PendingReviewRow } from '../types/dashboard.types';

const SLA_TONE: Record<PendingReviewRow['slaTone'], StatusTone> = {
  error: 'error',
  warning: 'warning',
  success: 'success',
};

/** Pending client reviews table with SLA chips and a link to the full queue. */
export function PendingReviewsTable({ rows }: { rows: PendingReviewRow[] }) {
  return (
    <Box>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table aria-label="Pending client reviews">
          <TableHead>
            <TableRow>
              <TableCell>Client & Deliverable</TableCell>
              <TableCell>Account Lead</TableCell>
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
                      {row.initials}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {row.client}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.deliverable}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{row.lead}</TableCell>
                <TableCell>{row.deadline}</TableCell>
                <TableCell>
                  <StatusChip label={row.sla} tone={SLA_TONE[row.slaTone]} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Showing {rows.length} of {rows.length} reviews pending approval
        </Typography>
        <Link component={RouterLink} to="/reviews" underline="hover" fontWeight={600} fontSize="0.875rem">
          View full approval queue →
        </Link>
      </Box>
    </Box>
  );
}

export default PendingReviewsTable;
