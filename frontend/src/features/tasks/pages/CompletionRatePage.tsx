import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, LinearProgress, Typography } from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import { getApiErrorMessage } from '../../../core/api/errors';
import { tasksService } from '../services/tasks.service';

/** Task Completion Rate: live aggregate (`GET /api/v1/reports/completion-rate`). */
export function CompletionRatePage() {
  const [stats, setStats] = useState({ total: 0, completed: 0, notCompleted: 0, rate: 0 });
  const [delayed, setDelayed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [rateRes, delayedRes] = await Promise.all([
        tasksService.completionRate(),
        tasksService.delayed({ limit: 1 }),
      ]);
      setStats(rateRes);
      setDelayed(delayedRes.pagination.total);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const percent = Math.round(stats.rate * 100);

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
            Live aggregate from the backend reports module.
          </Typography>
        </Box>
        <Chip label={`${stats.completed} of ${stats.total} completed`} color="success" variant="outlined" />
      </Box>
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading completion rate">
              <CircularProgress />
            </Box>
          ) : loadError ? (
            <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
              {loadError}
            </Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>COMPLETION RATE</Typography>
                    <Typography variant="h4" component="p" fontWeight={800}>{percent}%</Typography>
                    <LinearProgress variant="determinate" value={percent} sx={{ mt: 1 }} aria-label={`Completion rate ${percent}%`} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL TASKS</Typography>
                    <Typography variant="h4" component="p" fontWeight={800}>{stats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">{stats.notCompleted} still open</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>DELAYED NOW</Typography>
                    <Typography variant="h4" component="p" fontWeight={800}>{delayed}</Typography>
                    <Typography variant="body2" color="text.secondary">Past deadline, not completed</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default CompletionRatePage;
