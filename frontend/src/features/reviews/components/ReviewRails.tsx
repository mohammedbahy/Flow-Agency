import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ApiReview } from '../services/reviews.service';

/** Right-rail panel: recently approved items (live from the backend). */
export function RecentlyApprovedPanel({ items }: { items: ApiReview[] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Recently Approved
        </Typography>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nothing approved yet — approve a deliverable to see it here.
          </Typography>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map((item) => (
              <Box component="li" key={item.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.25 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[item.client, item.submittedBy].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

/** Right-rail panel: live queue snapshot. */
export function WorkflowSnapshotPanel({
  pending,
  approved,
  rejected,
}: {
  pending: number;
  approved: number;
  rejected: number;
}) {
  const total = pending + approved + rejected;
  const rows = [
    { label: 'Awaiting review', value: pending, color: 'warning.main' as const },
    { label: 'Approved', value: approved, color: 'success.main' as const },
    { label: 'Returned', value: rejected, color: 'error.main' as const },
  ];
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Queue snapshot
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {rows.map((row) => (
            <Box key={row.label}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {row.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {row.value}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={total === 0 ? 0 : Math.round((row.value / total) * 100)}
                sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: row.color } }}
                aria-label={`${row.label}: ${row.value} items`}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
