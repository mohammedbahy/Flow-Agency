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
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import ConfirmDialog, { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { kineticPalette } from '../../../core/theme/tokens';
import {
  REVIEW_STATUS_LABEL,
  REVIEW_TYPE_LABEL,
  type ReviewContentType,
  type ReviewItem,
  type ReviewStatus,
} from '../types/reviews.types';

const STATUS_TONE: Record<ReviewStatus, StatusTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const THUMBNAIL_STYLE: Record<ReviewContentType, { bg: string; icon: ReactNode }> = {
  copy: { bg: `linear-gradient(135deg, ${kineticPalette.tertiary} 0%, ${kineticPalette.primary} 100%)`, icon: <ArticleIcon fontSize="large" /> },
  visual: { bg: `linear-gradient(135deg, #6D28D9 0%, ${kineticPalette.primary} 100%)`, icon: <ImageIcon fontSize="large" /> },
  campaign: { bg: `linear-gradient(135deg, ${kineticPalette.primaryDark} 0%, #0C0F2E 100%)`, icon: <CampaignIcon fontSize="large" /> },
};

interface ReviewItemCardProps {
  item: ReviewItem;
  onApprove: (id: string) => void;
  onReject: (id: string, feedback: string) => void;
  onOpenProofing: (title: string) => void;
}

/** Single deliverable card: thumbnail, meta, preview, approve / request-revision actions. */
export function ReviewItemCard({ item, onApprove, onReject, onOpenProofing }: ReviewItemCardProps) {
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const approveDialog = useConfirmDialog();
  const thumb = THUMBNAIL_STYLE[item.contentType];
  const decided = item.status !== 'pending';

  function handleSendBack() {
    if (!feedback.trim()) {
      setFeedbackError('Add a short note so the author knows what to change.');
      return;
    }
    onReject(item.id, feedback.trim());
  }

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
              {REVIEW_TYPE_LABEL[item.contentType]}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
              <StatusChip label={REVIEW_STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
              <StatusChip label={item.assetNote} tone="default" />
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.client} · {item.project} · {item.submittedBy} · {item.submittedAt}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {item.preview}
            </Typography>
            {item.feedback ? (
              <Alert severity={item.status === 'approved' ? 'success' : 'warning'} sx={{ mt: 1.5 }}>
                <strong>Reviewer note:</strong> {item.feedback}
              </Alert>
            ) : null}
          </Box>
        </Box>

        {!decided ? (
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
                  <Button variant="contained" color="error" onClick={handleSendBack}>
                    Send back for revision
                  </Button>
                  <Button color="inherit" onClick={() => { setRevisionOpen(false); setFeedbackError(null); }}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : null}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="text" startIcon={<OpenInFullIcon />} onClick={() => onOpenProofing(item.title)}>
                Open Full-Screen Proofing Tool
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => setRevisionOpen(true)}>
                Request Revision
              </Button>
              <Button variant="contained" color="success" startIcon={<CheckIcon />} onClick={approveDialog.show}>
                Approve Deliverable
              </Button>
            </Box>
          </Box>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={approveDialog.open}
        title="Approve this deliverable?"
        message="The decision applies to the local preview only and is not sent anywhere."
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
