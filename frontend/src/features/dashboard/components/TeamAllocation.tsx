import { Box, Button, LinearProgress, Typography } from '@mui/material';
import type { AllocationRow } from '../types/dashboard.types';

interface TeamAllocationProps {
  rows: AllocationRow[];
  onOpenPlanner: () => void;
}

/** Team capacity bars with over-capacity highlighting. */
export function TeamAllocation({ rows, onOpenPlanner }: TeamAllocationProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map((row) => (
        <Box key={row.id}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
            <Box>
              <Typography variant="body2" fontWeight={700}>
                {row.team}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.detail}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              fontWeight={700}
              color={row.overCapacity ? 'error.main' : 'text.secondary'}
            >
              {row.note}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(row.percent, 100)}
            color={row.overCapacity ? 'error' : 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
            aria-label={`${row.team} allocation ${row.percent} percent`}
          />
        </Box>
      ))}
      <Button variant="outlined" onClick={onOpenPlanner} sx={{ alignSelf: 'flex-start' }}>
        Open Resource Planner
      </Button>
    </Box>
  );
}

export default TeamAllocation;
