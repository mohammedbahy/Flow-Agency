import { Box, Button, Card, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { kineticPalette } from '../../../core/theme/tokens';

interface ReviewBannerProps {
  pendingCount: number;
  onApproveAll: () => void;
}

/** Purple action banner summarizing the pending queue. */
export function ReviewBanner({ pendingCount, onApproveAll }: ReviewBannerProps) {
  return (
    <Card
      sx={{
        background: `linear-gradient(120deg, ${kineticPalette.primary} 0%, #6D28D9 100%)`,
        color: '#FFFFFF',
        border: 'none',
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography variant="h6" fontWeight={800}>
            Action Required: You have {pendingCount} deliverable item{pendingCount === 1 ? '' : 's'} awaiting review
          </Typography>
          <Typography variant="body2" sx={{ color: '#E0E7FF' }}>
            Decisions below are recorded in the backend immediately.
          </Typography>
        </Box>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={onApproveAll}
          disabled={pendingCount === 0}
          sx={{ bgcolor: '#FFFFFF', color: kineticPalette.primary, '&:hover': { bgcolor: '#EEF0FF' } }}
        >
          Approve All ({pendingCount})
        </Button>
      </Box>
    </Card>
  );
}

export default ReviewBanner;
