import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
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
import RuleDialog from '../components/RuleDialog';
import { MOCK_DEADLINE_RULES } from '../mock/settings.mock';
import { DEADLINE_APPLIES_LABEL, type DeadlineRule, type DeadlineRuleForm } from '../types/settings.types';

/** Deadline Rules screen: SLA-style limits with create/edit/enable/delete. All local mock state. */
export function DeadlineRulesPage() {
  const [rules, setRules] = useState<DeadlineRule[]>(MOCK_DEADLINE_RULES);
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; rule: DeadlineRule | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeadlineRule | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const deleteDialog = useConfirmDialog();

  function handleDialogSubmit(values: DeadlineRuleForm) {
    if (dialog?.mode === 'create') {
      const created: DeadlineRule = { id: `local-${Date.now()}`, ...values, limit: Number(values.limit) };
      setRules((prev) => [...prev, created]);
      setFlash(`Rule “${created.name}” added (local preview — not saved).`);
    } else if (dialog?.rule) {
      setRules((prev) =>
        prev.map((r) => (r.id === dialog.rule?.id ? { ...r, ...values, limit: Number(values.limit) } : r)),
      );
      setFlash(`Rule “${values.name}” updated (local preview — not saved).`);
    }
    setDialog(null);
  }

  function handleDelete() {
    if (!pendingDelete) return;
    setRules((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    setFlash(`Rule “${pendingDelete.name}” deleted (local preview — not saved).`);
    setPendingDelete(null);
    deleteDialog.hide();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings • Delivery governance"
        title="Deadline Rules"
        subtitle="Time limits and escalation actions for reviews, tasks and deliverables. Changes are local preview state."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'create', rule: null })}>
            Add rule
          </Button>
        }
      />

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table aria-label="Deadline rules">
              <TableHead>
                <TableRow>
                  <TableCell>Rule</TableCell>
                  <TableCell>Applies to</TableCell>
                  <TableCell>Time limit</TableCell>
                  <TableCell>Escalation action</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {rule.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{DEADLINE_APPLIES_LABEL[rule.appliesTo]}</TableCell>
                    <TableCell>
                      {rule.limit} {rule.unit}
                    </TableCell>
                    <TableCell>{rule.action || '—'}</TableCell>
                    <TableCell>
                      <StatusChip label={rule.enabled ? 'Enabled' : 'Disabled'} tone={rule.enabled ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Switch
                        checked={rule.enabled}
                        onChange={() =>
                          setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)))
                        }
                        aria-label={`${rule.enabled ? 'Disable' : 'Enable'} rule ${rule.name}`}
                        size="small"
                      />
                      <IconButton size="small" aria-label={`Edit rule ${rule.name}`} onClick={() => setDialog({ mode: 'edit', rule })}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`Delete rule ${rule.name}`}
                        onClick={() => {
                          setPendingDelete(rule);
                          deleteDialog.show();
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {dialog ? (
        <RuleDialog open mode={dialog.mode} initial={dialog.rule} onClose={() => setDialog(null)} onSubmit={handleDialogSubmit} />
      ) : null}

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete this rule?"
        message={pendingDelete ? `“${pendingDelete.name}” will be removed from the local preview.` : ''}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => {
          deleteDialog.hide();
          setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}

export default DeadlineRulesPage;
