import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog, { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import ReviewBanner from '../components/ReviewBanner';
import ReviewItemCard from '../components/ReviewItemCard';
import { RecentlyApprovedPanel, WorkflowSnapshotPanel } from '../components/ReviewRails';
import { reviewsService, type ApiReview } from '../services/reviews.service';

/** Reviews workspace — live review queue (`/api/v1/reviews`). */
export function ReviewsPage() {
  const { can } = useAuth();
  const [items, setItems] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const approveAllDialog = useConfirmDialog();

  const canDecide = can('reviews:manage');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await reviewsService.list({ limit: 100 });
      setItems(data);
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = items.filter((i) => i.status === 'pending');
  const approved = items.filter((i) => i.status === 'approved');
  const rejected = items.filter((i) => i.status === 'rejected');

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await reviewsService.approve(id);
      setToast('Deliverable approved successfully.');
      await load();
    } catch (error) {
      setToast(getApiErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string, feedback: string) {
    setBusyId(id);
    try {
      await reviewsService.reject(id, feedback);
      setToast('Sent back for revision successfully.');
      await load();
    } catch (error) {
      setToast(getApiErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  async function handleApproveAll() {
    approveAllDialog.hide();
    const ids = pending.map((i) => i.id);
    try {
      for (const id of ids) {
        await reviewsService.approve(id);
      }
      setToast(`Approved ${ids.length} items successfully.`);
      await load();
    } catch (error) {
      setToast(getApiErrorMessage(error));
      await load();
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Delivery • Content approval"
        title="Reviews"
        subtitle={`${pending.length} awaiting review · ${approved.length} approved · live data from the backend.`}
      />

      <ReviewBanner pendingCount={pending.length} onApproveAll={approveAllDialog.show} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading reviews">
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : (
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
                  <ReviewItemCard
                    key={item.id}
                    item={item}
                    busy={busyId === item.id}
                    canDecide={canDecide}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              )}
            </Box>

            {rejected.length > 0 ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  Returned for Revision
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {rejected.map((item) => (
                    <ReviewItemCard
                      key={item.id}
                      item={item}
                      busy={busyId === item.id}
                      canDecide={canDecide}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </Box>
              </Box>
            ) : null}
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RecentlyApprovedPanel items={approved} />
              <WorkflowSnapshotPanel
                pending={pending.length}
                approved={approved.length}
                rejected={rejected.length}
              />
            </Box>
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={approveAllDialog.open}
        title={`Approve all ${pending.length} items?`}
        message="Every pending deliverable will be marked approved in the backend."
        confirmLabel="Approve all"
        confirmColor="success"
        onConfirm={() => void handleApproveAll()}
        onClose={approveAllDialog.hide}
      />
      <Snackbar open={toast !== null} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default ReviewsPage;
