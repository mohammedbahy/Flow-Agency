import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import type { KpiCard } from '../types/dashboard.types';

function toneColor(tone: 'default' | 'warning' | 'success' | undefined): string {
  if (tone === 'warning') return 'warning.main';
  if (tone === 'success') return 'success.main';
  return 'text.secondary';
}

/** Executive KPI card: eyebrow, headline value, caption, stat chips. */
export function KpiCardView({ kpi }: { kpi: KpiCard }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.08em' }} color="text.secondary">
          {kpi.eyebrow.toUpperCase()}
        </Typography>
        <Typography variant="h4" component="p" fontWeight={800} sx={{ mt: 0.5 }}>
          {kpi.value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {kpi.caption}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
          {kpi.stats.map((stat) => (
            <Chip
              key={stat.label}
              label={stat.label}
              size="small"
              variant="outlined"
              sx={{ color: toneColor(stat.tone), borderColor: 'divider' }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default KpiCardView;
