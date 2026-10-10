import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import StatusChip from '../../../shared/components/StatusChip';
import ConfirmDialog, { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import RuleDialog from '../components/RuleDialog';
import { deadlineRulesService, type ApiDeadlineRule } from '../services/deadline-rules.service';
import { describeRule, TASK_TYPE_LABEL, type DeadlineRuleForm } from '../types/settings.types';

/** Deadline Rules screen — live SLA rules (`/api/v1/deadline-rules`). */
export function DeadlineRulesPage() {
  const { can } = useAuth();
  const [rules, setRules] = useState<ApiDeadlineRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; rule: ApiDeadlineRule | null } | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ApiDeadlineRule | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const deleteDialog = useConfirmDialog();

  const canManage = can('deadline_rules:manage');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRules(await deadlineRulesService.list());
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDialogSubmit(values: DeadlineRuleForm) {
    setDialogBusy(true);
    try {
      const body = {
        taskType: values.taskType,
        offsetValue: Number(values.offsetValue),
        offsetUnit: values.offsetUnit,
        direction: values.direction,
        active: values.active,
      };
      if (dialog?.mode === 'create') {
        await deadlineRulesService.create(body);
        setFlash(`Rule for “${TASK_TYPE_LABEL[values.taskType]}” added successfully.`);
      } else if (dialog?.rule) {
        await deadlineRulesService.update(dialog.rule.id, body);
        setFlash('Rule updated successfully.');
      }
      setDialog(null);
      await load();
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    } finally {
      setDialogBusy(false);
    }
  }

  async function handleToggle(rule: ApiDeadlineRule) {
    try {
      await deadlineRulesService.update(rule.id, { active: !rule.active });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r)));
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await deadlineRulesService.remove(pendingDelete.id);
      setFlash(`Rule for “${TASK_TYPE_LABEL[pendingDelete.taskType]}” deleted.`);
      await load();
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    } finally {
      setPendingDelete(null);
      deleteDialog.hide();
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings • Delivery governance"
        title="Deadline Rules"
        subtitle="Automatic deadline calculation per task type. Changes persist to the backend."
        actions={
          canManage ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'create', rule: null })}>
              Add rule
            </Button>
          ) : undefined
        }
      />

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading deadline rules">
              <CircularProgress />
            </Box>
          ) : loadError ? (
            <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
              {loadError}
            </Alert>
          ) : rules.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">
              No deadline rules yet. {canManage ? 'Add the first rule to enable automatic deadlines.' : ''}
            </Typography>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table aria-label="Deadline rules">
                <TableHead>
                  <TableRow>
                    <TableCell>Task type</TableCell>
                    <TableCell>Offset</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {TASK_TYPE_LABEL[rule.taskType] ?? rule.taskType}
                        </Typography>
                      </TableCell>
                      <TableCell>{describeRule(rule.offsetValue, rule.offsetUnit, rule.direction)}</TableCell>
                      <TableCell>
                        <StatusChip label={rule.active ? 'Enabled' : 'Disabled'} tone={rule.active ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Switch
                          checked={rule.active}
                          disabled={!canManage}
                          onChange={() => void handleToggle(rule)}
                          aria-label={`${rule.active ? 'Disable' : 'Enable'} rule for ${rule.taskType}`}
                          size="small"
                        />
                        {canManage ? (
                          <>
                            <IconButton size="small" aria-label={`Edit rule for ${rule.taskType}`} onClick={() => setDialog({ mode: 'edit', rule })}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label={`Delete rule for ${rule.taskType}`}
                              onClick={() => {
                                setPendingDelete(rule);
                                deleteDialog.show();
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {dialog ? (
        <RuleDialog open mode={dialog.mode} initial={dialog.rule} onClose={() => setDialog(null)} onSubmit={(v) => void handleDialogSubmit(v)} submitting={dialogBusy} />
      ) : null}

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete this rule?"
        message={pendingDelete ? `The “${TASK_TYPE_LABEL[pendingDelete.taskType]}” rule will be removed.` : ''}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => void handleDelete()}
        onClose={() => {
          deleteDialog.hide();
          setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}

export default DeadlineRulesPage;
