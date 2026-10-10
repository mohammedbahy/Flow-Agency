import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import StatusChip from '../../../shared/components/StatusChip';
import { getApiErrorMessage } from '../../../core/api/errors';
import { brandsService } from '../services/analytics.service';
import { tasksService } from '../../tasks/services/tasks.service';

interface BrandRow {
  id: string;
  brand: string;
  client: string;
  status: string;
  completionRate: number | null;
  totalTasks: number;
}

function healthOf(rate: number | null): { label: string; tone: 'success' | 'warning' | 'error' | 'default' } {
  if (rate === null) return { label: 'New', tone: 'default' };
  if (rate >= 0.8) return { label: 'Healthy', tone: 'success' };
  if (rate >= 0.5) return { label: 'Watch', tone: 'warning' };
  return { label: 'At risk', tone: 'error' };
}

/** Brand Performance & Workflow dashboard — live brands, metrics, and workflow. */
export function BrandPerformancePage() {
  const [rows, setRows] = useState<BrandRow[]>([]);
  const [workflow, setWorkflow] = useState({ approved: 0, delayed: 0, completed: 0, live: false });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ data }, rateRes, delayedRes] = await Promise.all([
        brandsService.list({ limit: 100 }),
        tasksService.completionRate(),
        tasksService.delayed({ limit: 1 }),
      ]);
      const metrics = await Promise.all(
        data.map((b) =>
          brandsService.metrics(b.id).catch(() => ({ brand: { id: b.id, name: b.name }, completionRate: null as number | null, averageCompletionTimeMs: null as number | null })),
        ),
      );
      const workflows = await Promise.all(data.map((b) => brandsService.workflow(b.id).catch(() => null)));
      setRows(
        data.map((b, i) => ({
          id: b.id,
          brand: b.name,
          client: b.client?.name ?? '—',
          status: b.status,
          completionRate: metrics[i]?.completionRate ?? null,
          totalTasks: workflows[i]?.workflow.totalTasks ?? 0,
        })),
      );
      setWorkflow({
        approved: rateRes.completed,
        delayed: delayedRes.pagination.total,
        completed: rateRes.completed,
        live: true,
      });
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rates = rows.map((r) => r.completionRate).filter((r): r is number => r !== null);
  const avgRate = rates.length > 0 ? Math.round((rates.reduce((s, r) => s + r, 0) / rates.length) * 100) : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Analytics • Brand performance"
        title="Brand Performance & Workflow"
        subtitle="Brand health from live completion metrics plus workflow visibility. Live data from the backend."
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading brand performance">
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em' }} color="text.secondary">
                    ACTIVE BRANDS
                  </Typography>
                  <Typography variant="h4" component="p" fontWeight={800}>
                    {rows.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Across {new Set(rows.map((b) => b.client)).size} client accounts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em' }} color="text.secondary">
                    AVG COMPLETION RATE
                  </Typography>
                  <Typography variant="h4" component="p" fontWeight={800}>
                    {avgRate === null ? '—' : `${avgRate}%`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Across brands with completed work
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em' }} color="text.secondary">
                    DELIVERABLES COMPLETED
                  </Typography>
                  <Typography variant="h4" component="p" fontWeight={800}>
                    {workflow.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live from the reports module
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em' }} color="text.secondary" gutterBottom>
                    WORKFLOW STAGES
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
                    <Chip label={`${workflow.approved} approved`} color="success" size="small" />
                    <Chip label={`${workflow.delayed} delayed`} color="error" size="small" />
                    <Chip label={`${workflow.completed} completed`} color="info" size="small" />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {workflow.live ? 'Live from the backend reports module.' : 'Loading live workflow…'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Brand breakdown
              </Typography>
              {rows.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }} align="center">
                  No brands yet. Create brands through the backend to populate this view.
                </Typography>
              ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table aria-label="Brand performance">
                    <TableHead>
                      <TableRow>
                        <TableCell>Brand</TableCell>
                        <TableCell>Health</TableCell>
                        <TableCell>Completion rate</TableCell>
                        <TableCell>Total tasks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((brand) => {
                        const health = healthOf(brand.completionRate);
                        const percent = brand.completionRate === null ? 0 : Math.round(brand.completionRate * 100);
                        return (
                          <TableRow key={brand.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={700}>
                                {brand.brand}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {brand.client}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusChip label={health.label} tone={health.tone} />
                            </TableCell>
                            <TableCell sx={{ minWidth: 160 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={percent}
                                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                  aria-label={`${brand.brand} completion rate ${percent} percent`}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {brand.completionRate === null ? '—' : `${percent}%`}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{brand.totalTasks}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </PageContainer>
  );
}

export default BrandPerformancePage;
