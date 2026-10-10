import { useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import CampaignIcon from '@mui/icons-material/Campaign';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import ConfirmDialog, { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { kineticPalette } from '../../../core/theme/tokens';
import type { ApiReview, ReviewContentType, ReviewStatus } from '../services/reviews.service';

const STATUS_TONE: Record<ReviewStatus, StatusTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'Awaiting review',
  approved: 'Approved',
  rejected: 'Needs changes',
};

const TYPE_LABEL: Record<ReviewContentType, string> = {
  copy: 'Copy',
  visual: 'Visual',
  campaign: 'Campaign',
};

const THUMBNAIL_STYLE: Record<ReviewContentType, { bg: string; icon: ReactNode }> = {
  copy: { bg: `linear-gradient(135deg, ${kineticPalette.tertiary} 0%, ${kineticPalette.primary} 100%)`, icon: <ArticleIcon fontSize="large" /> },
  visual: { bg: `linear-gradient(135deg, #6D28D9 0%, ${kineticPalette.primary} 100%)`, icon: <ImageIcon fontSize="large" /> },
  campaign: { bg: `linear-gradient(135deg, ${kineticPalette.primaryDark} 0%, #0C0F2E 100%)`, icon: <CampaignIcon fontSize="large" /> },
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}

interface ReviewItemCardProps {
  item: ApiReview;
  busy?: boolean;
  canDecide: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, feedback: string) => void;
}

/** Single deliverable card: live content with approve / request-revision actions. */
export function ReviewItemCard({ item, busy = false, canDecide, onApprove, onReject }: ReviewItemCardProps) {
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const approveDialog = useConfirmDialog();
  const thumb = THUMBNAIL_STYLE[item.contentType] ?? THUMBNAIL_STYLE.copy;
  const decided = item.status !== 'pending';

  function handleSendBack() {
    if (!feedback.trim()) {
      setFeedbackError('Add a short note so the author knows what to change.');
      return;
    }
    onReject(item.id, feedback.trim());
  }

  const meta = [item.client, item.project, item.submittedBy, formatDate(item.createdAt)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
          <Box
            aria-hidden
            sx={{
              width: { xs: '100%', sm: 148 },
              height: 112,
              flexShrink: 0,
              borderRadius: 3,
              background: thumb.bg,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {thumb.icon}
            <Typography variant="caption" fontWeight={700}>
              {TYPE_LABEL[item.contentType]}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
              <StatusChip label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {item.title}
            </Typography>
            {meta ? (
              <Typography variant="body2" color="text.secondary">
                {meta}
              </Typography>
            ) : null}
            {item.preview ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {item.preview}
              </Typography>
            ) : null}
            {item.feedback ? (
              <Alert severity={item.status === 'approved' ? 'success' : 'warning'} sx={{ mt: 1.5 }}>
                <strong>Reviewer note:</strong> {item.feedback}
              </Alert>
            ) : null}
          </Box>
        </Box>

        {!decided && canDecide ? (
          <Box sx={{ mt: 2 }}>
            {revisionOpen ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
                <TextField
                  id={`revision-${item.id}`}
                  label="What should the author change?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  error={Boolean(feedbackError)}
                  helperText={feedbackError ?? ' '}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" color="error" onClick={handleSendBack} disabled={busy}>
                    Send back for revision
                  </Button>
                  <Button color="inherit" onClick={() => { setRevisionOpen(false); setFeedbackError(null); }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : null}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => setRevisionOpen(true)}>
                Request Revision
              </Button>
              <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={approveDialog.show} disabled={busy}>
                Approve Deliverable
              </Button>
            </Box>
          </Box>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={approveDialog.open}
        title="Approve this deliverable?"
        message="The approval is recorded in the backend immediately."
        confirmLabel="Approve"
        confirmColor="success"
        onConfirm={() => {
          approveDialog.hide();
          onApprove(item.id);
        }}
        onClose={approveDialog.hide}
      />
    </Card>
  );
}

export default ReviewItemCard;
