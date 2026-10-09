import { Box, Button, Card, CardContent, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StatusChip from '../../../shared/components/StatusChip';
import type { ProjectProgress, ReviewItem } from '../types/reviews.types';

/** Right-rail panel: active project progress bars. */
export function ProjectProgressPanel({ projects }: { projects: ProjectProgress[] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Active Projects Progress
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {projects.map((project) => (
            <Box key={project.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={700}>
                  {project.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {project.percent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={project.percent}
                sx={{ height: 8, borderRadius: 4 }}
                aria-label={`${project.name} progress ${project.percent} percent`}
              />
              <Typography variant="caption" color="text.secondary">
                {project.detail}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

/** Right-rail panel: recently approved items (updates live with local approvals). */
export function RecentlyApprovedPanel({ items }: { items: ReviewItem[] }) {
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
                    {item.client} · {item.submittedBy}
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

/** Right-rail panel: review throughput note (decorative actions in preview). */
export function NewReviewsPanel({ onOpenSlack, onScale }: { onOpenSlack: () => void; onScale: () => void }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" component="h3">
            New Reviews
          </Typography>
          <StatusChip label="3.4 hrs avg SLA" tone="success" />
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Review throughput is inside the contractual window. Loop the client channel in for faster sign-off.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Button variant="outlined" size="small" onClick={onOpenSlack}>
            Open Slack Channel
          </Button>
          <Button variant="contained" size="small" onClick={onScale}>
            Scale Review
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
