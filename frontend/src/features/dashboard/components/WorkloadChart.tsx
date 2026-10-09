import { Box, Typography } from '@mui/material';
import { kineticPalette } from '../../../core/theme/tokens';
import type { WorkloadWeek } from '../types/dashboard.types';

const MAX = 100;
const BAR_WIDTH = 26;

/** Weekly workload chart (CSS bars): delivered vs planned target. Mock data only. */
export function WorkloadChart({ weeks }: { weeks: WorkloadWeek[] }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box component="span" sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: kineticPalette.primary }} aria-hidden />
          Delivered
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <Box component="span" sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: '#C7D2FE' }} aria-hidden />
          Planned Target
        </Typography>
      </Box>
      <Box
        role="img"
        aria-label="Weekly workload chart comparing delivered output against planned target"
        sx={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 180, px: 1 }}
      >
        {weeks.map((week) => (
          <Box key={week.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 140 }}>
              <Box
                sx={{
                  width: BAR_WIDTH,
                  height: `${(week.delivered / MAX) * 100}%`,
                  minHeight: 8,
                  bgcolor: kineticPalette.primary,
                  borderRadius: '6px 6px 2px 2px',
                }}
              >
                <Typography variant="caption" sx={{ display: 'none' }}>
                  Delivered {week.delivered}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: BAR_WIDTH,
                  height: `${(week.planned / MAX) * 100}%`,
                  minHeight: 8,
                  bgcolor: '#C7D2FE',
                  borderRadius: '6px 6px 2px 2px',
                }}
              >
                <Typography variant="caption" sx={{ display: 'none' }}>
                  Planned {week.planned}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {week.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        Overall Agency Velocity: 84.2% completion vs capacity • Media Buying pacing +18% above target
      </Typography>
    </Box>
  );
}

export default WorkloadChart;
