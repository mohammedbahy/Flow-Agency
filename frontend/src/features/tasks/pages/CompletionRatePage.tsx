import { useState } from 'react';
import { Box, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { MOCK_TASK_ROWS } from '../mock/tasks.mock';

/** Task Completion Rate: per-project completion bars — all local mock state. */
export function CompletionRatePage() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = MOCK_TASK_ROWS.filter(
    (t) => q.length === 0 || t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q),
  );
  const avg = Math.round(rows.reduce((s, t) => s + t.completion, 0) / Math.max(rows.length, 1));

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            DELIVERY INSIGHTS • Throughput
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Task Completion Rate
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average completion across the visible tasks in this preview.
          </Typography>
        </Box>
        <Chip label={`Average ${avg}%`} color="success" variant="outlined" />
      </Box>
      <Card>
        <CardContent>
          <Box sx={{ maxWidth: 420, mb: 2 }}>
            <SearchField label="Search tasks" placeholder="Search tasks or projects" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          </Box>
          <Grid container spacing={2}>
            {rows.map((task) => (
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
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default CompletionRatePage;
