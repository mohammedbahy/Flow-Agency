import { Box, Typography } from '@mui/material';
import { kineticPalette } from '../../../core/theme/tokens';

export interface WorkloadWeek {
  label: string;
  value: number;
}

/** New-tasks-per-week bars computed from live task records. */
export function WorkloadChart({ weeks, caption }: { weeks: WorkloadWeek[]; caption: string }) {
  const max = Math.max(1, ...weeks.map((w) => w.value));
  return (
    <Box>
      <Box
        role="img"
        aria-label="New tasks per week chart"
        sx={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 180, px: 1 }}
      >
        {weeks.map((week) => (
          <Box key={week.label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 140 }}>
              <Box
                sx={{
                  width: 30,
                  height: `${Math.max((week.value / max) * 100, week.value > 0 ? 6 : 2)}%`,
                  bgcolor: kineticPalette.primary,
                  borderRadius: '6px 6px 2px 2px',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {week.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        {caption}
      </Typography>
    </Box>
  );
}

export default WorkloadChart;
