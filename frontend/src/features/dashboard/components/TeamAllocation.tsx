import { Box, Button, LinearProgress, Typography } from '@mui/material';

export interface AllocationRow {
  id: string;
  team: string;
  detail: string;
  percent: number;
  note: string;
  overCapacity?: boolean;
}

interface TeamAllocationProps {
  rows: AllocationRow[];
  onOpenPlanner: () => void;
}

/** Team load bars (live member + task counts). */
export function TeamAllocation({ rows, onOpenPlanner }: TeamAllocationProps) {
  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No teams yet.
      </Typography>
    );
  }
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
            aria-label={`${row.team} load ${row.percent} percent`}
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
