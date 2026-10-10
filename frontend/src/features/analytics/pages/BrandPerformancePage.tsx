import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
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
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import { MOCK_REVIEWS } from '../../reviews/mock/reviews.mock';
import { MOCK_TASKS } from '../../tasks/mock/tasks.mock';
import { MOCK_BRAND_METRICS } from '../mock/analytics.mock';
import { BRAND_HEALTH_LABEL, type BrandHealth } from '../types/analytics.types';

type RangeKey = '7d' | '30d' | '90d';

const RANGE_LABEL: Record<RangeKey, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

// Static preview scaling per range (mock only — backend will return real windows).
const RANGE_FACTOR: Record<RangeKey, number> = { '7d': 1, '30d': 3.4, '90d': 9.2 };

const HEALTH_TONE: Record<BrandHealth, StatusTone> = {
  healthy: 'success',
  watch: 'warning',
  'at-risk': 'error',
};

/** Brand Performance & Workflow dashboard: brand metrics, workflow stages, approval bars. Mock data only. */
export function BrandPerformancePage() {
  const [range, setRange] = useState<RangeKey>('7d');
  const factor = RANGE_FACTOR[range];

  const brands = useMemo(
    () =>
      MOCK_BRAND_METRICS.map((b) => ({
        ...b,
        inReview: Math.round(b.inReview * factor),
        delayed: Math.round(b.delayed * factor),
        completed: Math.round(b.completed * factor),
      })),
    [factor],
  );

  const totals = useMemo(() => {
    const inReview = MOCK_REVIEWS.filter((r) => r.status === 'pending').length;
    const approved = MOCK_REVIEWS.filter((r) => r.status === 'approved').length;
    const delayed = MOCK_TASKS.filter((t) => t.status === 'delayed').length;
    const completed = MOCK_TASKS.filter((t) => t.status === 'completed').length;
    return { inReview, approved, delayed, completed };
  }, []);

  const avgApproval = Math.round(brands.reduce((sum, b) => sum + b.approvalRate, 0) / brands.length);
  const completedTotal = brands.reduce((sum, b) => sum + b.completed, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Analytics • Brand performance"
        title="Brand Performance & Workflow"
        subtitle="Approval health and workflow visibility per brand. All figures are static preview data."
        actions={
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="range-label">Date range</InputLabel>
            <Select labelId="range-label" id="range" label="Date range" value={range} onChange={(e) => setRange(e.target.value as RangeKey)}>
              {(Object.keys(RANGE_LABEL) as RangeKey[]).map((r) => (
                <MenuItem key={r} value={r}>
                  {RANGE_LABEL[r]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em' }} color="text.secondary">
                ACTIVE BRANDS
              </Typography>
              <Typography variant="h4" component="p" fontWeight={800}>
                {brands.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {new Set(brands.map((b) => b.client)).size} client accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em' }} color="text.secondary">
                AVG APPROVAL RATE
              </Typography>
              <Typography variant="h4" component="p" fontWeight={800}>
                {avgApproval}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {RANGE_LABEL[range]}
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
                {completedTotal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {RANGE_LABEL[range]}
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
                <Chip label={`${totals.inReview} pending review`} color="warning" size="small" />
                <Chip label={`${totals.approved} approved`} color="success" size="small" />
                <Chip label={`${totals.delayed} delayed`} color="error" size="small" />
                <Chip label={`${totals.completed} completed`} color="info" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            Brand breakdown
          </Typography>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table aria-label="Brand performance">
              <TableHead>
                <TableRow>
                  <TableCell>Brand</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Approval rate</TableCell>
                  <TableCell>In review</TableCell>
                  <TableCell>Delayed</TableCell>
                  <TableCell>Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brands.map((brand) => (
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
                      <StatusChip label={BRAND_HEALTH_LABEL[brand.health]} tone={HEALTH_TONE[brand.health]} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 160 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={brand.approvalRate}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          aria-label={`${brand.brand} approval rate ${brand.approvalRate} percent`}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {brand.approvalRate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{brand.inReview}</TableCell>
                    <TableCell>{brand.delayed}</TableCell>
                    <TableCell>{brand.completed}</TableCell>
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

export default BrandPerformancePage;
