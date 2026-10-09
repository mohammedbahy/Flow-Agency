import { useState } from 'react';
import { Box, Card, CardContent, Chip, Grid, Snackbar, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import ConfirmDialog, { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import ReviewBanner from '../components/ReviewBanner';
import ReviewItemCard from '../components/ReviewItemCard';
import { NewReviewsPanel, ProjectProgressPanel, RecentlyApprovedPanel } from '../components/ReviewRails';
import { MOCK_PROJECT_PROGRESS, MOCK_REVIEWS } from '../mock/reviews.mock';

/** Reviews workspace: project header, action banner, deliverable cards, progress rails. All local mock state. */
export function ReviewsPage() {
  const [items, setItems] = useState(MOCK_REVIEWS);
  const [toast, setToast] = useState<string | null>(null);
  const approveAllDialog = useConfirmDialog();

  const pending = items.filter((i) => i.status === 'pending');
  const approved = items.filter((i) => i.status === 'approved');
  const previewNote = (action: string) =>
    setToast(`${action} is decorative in this UI preview — available in a future sprint.`);

  function handleApprove(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item)));
    setToast('Approved in local preview — no backend call was made.');
  }

  function handleReject(id: string, feedback: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' as const, feedback } : item)),
    );
    setToast('Sent back for revision in local preview — no backend call was made.');
  }

  function handleApproveAll() {
    approveAllDialog.hide();
    setItems((prev) => prev.map((item) => (item.status === 'pending' ? { ...item, status: 'approved' as const } : item)));
    setToast(`Approved ${pending.length} items in local preview — no backend call was made.`);
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Chip label="Apex Finish" color="primary" />
        <Box>
          <Typography variant="h5" component="h2" fontWeight={800}>
            Q4 Performance Creative Set
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reviewing 18 of 32 assets
          </Typography>
        </Box>
      </Box>

      <Tabs value="overview" aria-label="Project views" variant="scrollable" scrollButtons="auto">
        <Tab label="Overview" value="overview" />
        {['My Projects', 'Content Library', 'Users', 'Support'].map((label) => (
          <Tooltip key={label} title="Available in a future sprint" placement="top">
            <Tab label={label} value={label} disabled />
          </Tooltip>
        ))}
      </Tabs>

      <ReviewBanner pendingCount={pending.length} onApproveAll={approveAllDialog.show} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            Items Requiring Review & Approval
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pending.length === 0 ? (
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Queue clear — every deliverable has a decision. New submissions will appear here.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              pending.map((item) => (
                <ReviewItemCard key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} onOpenProofing={(title) => previewNote(`Proofing tool for “${title}”`)} />
              ))
            )}
          </Box>

          {items.some((i) => i.status === 'rejected') ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Returned for Revision
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items
                  .filter((i) => i.status === 'rejected')
                  .map((item) => (
                    <ReviewItemCard key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} onOpenProofing={(title) => previewNote(`Proofing tool for “${title}”`)} />
                  ))}
              </Box>
            </Box>
          ) : null}
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ProjectProgressPanel projects={MOCK_PROJECT_PROGRESS} />
            <RecentlyApprovedPanel items={approved} />
            <NewReviewsPanel onOpenSlack={() => previewNote('Slack channel')} onScale={() => previewNote('Scale review')} />
          </Box>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={approveAllDialog.open}
        title={`Approve all ${pending.length} items?`}
        message="Every pending deliverable will be marked approved in the local preview only. Nothing is sent anywhere."
        confirmLabel="Approve all"
        confirmColor="success"
        onConfirm={handleApproveAll}
        onClose={approveAllDialog.hide}
      />
      <Snackbar open={toast !== null} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default ReviewsPage;
