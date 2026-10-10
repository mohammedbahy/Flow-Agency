import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import type { ApiDeadlineRule } from '../services/deadline-rules.service';
import {
  DIRECTION_LABEL,
  TASK_TYPE_LABEL,
  validateDeadlineRule,
  type DeadlineRuleErrors,
  type DeadlineRuleForm,
} from '../types/settings.types';

interface RuleDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ApiDeadlineRule | null;
  onClose: () => void;
  onSubmit: (values: DeadlineRuleForm) => void;
  submitting?: boolean;
}

/** Deadline-rule create/edit dialog — fields mirror `POST /api/v1/deadline-rules`. */
export function RuleDialog({ open, mode, initial, onClose, onSubmit, submitting = false }: RuleDialogProps) {
  const [taskType, setTaskType] = useState<DeadlineRuleForm['taskType']>(initial?.taskType ?? 'design');
  const [offsetValue, setOffsetValue] = useState(initial ? String(initial.offsetValue) : '');
  const [offsetUnit, setOffsetUnit] = useState<DeadlineRuleForm['offsetUnit']>(initial?.offsetUnit ?? 'hours');
  const [direction, setDirection] = useState<DeadlineRuleForm['direction']>(initial?.direction ?? 'before');
  const [active, setActive] = useState(initial?.active ?? true);
  const [errors, setErrors] = useState<DeadlineRuleErrors>({});

  const dialogKey = initial?.id ?? mode;
  const [lastKey, setLastKey] = useState(dialogKey);
  if (lastKey !== dialogKey) {
    setLastKey(dialogKey);
    setTaskType(initial?.taskType ?? 'design');
    setOffsetValue(initial ? String(initial.offsetValue) : '');
    setOffsetUnit(initial?.offsetUnit ?? 'hours');
    setDirection(initial?.direction ?? 'before');
    setActive(initial?.active ?? true);
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateDeadlineRule({ taskType, offsetValue, offsetUnit, direction, active });
    setErrors(nextErrors);
    if (nextErrors.offsetValue) return;
    onSubmit({ taskType, offsetValue, offsetUnit, direction, active });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add deadline rule' : 'Edit deadline rule'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="rule-task-type-label">Task type</InputLabel>
              <Select labelId="rule-task-type-label" id="rule-task-type" label="Task type" value={taskType} onChange={(e) => setTaskType(e.target.value as DeadlineRuleForm['taskType'])}>
                {(Object.keys(TASK_TYPE_LABEL) as DeadlineRuleForm['taskType'][]).map((key) => (
                  <MenuItem key={key} value={key}>
                    {TASK_TYPE_LABEL[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              id="rule-offset"
              label="Offset"
              inputMode="numeric"
              value={offsetValue}
              onChange={(e) => setOffsetValue(e.target.value)}
              error={Boolean(errors.offsetValue)}
              helperText={errors.offsetValue ?? ' '}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="rule-unit-label">Unit</InputLabel>
              <Select labelId="rule-unit-label" id="rule-unit" label="Unit" value={offsetUnit} onChange={(e) => setOffsetUnit(e.target.value as DeadlineRuleForm['offsetUnit'])}>
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <FormControl fullWidth>
          <InputLabel id="rule-direction-label">Direction</InputLabel>
          <Select labelId="rule-direction-label" id="rule-direction" label="Direction" value={direction} onChange={(e) => setDirection(e.target.value as DeadlineRuleForm['direction'])}>
            <MenuItem value="before">{DIRECTION_LABEL.before}</MenuItem>
            <MenuItem value="after">{DIRECTION_LABEL.after}</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} id="rule-enabled" />}
          label="Rule enabled"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {mode === 'create' ? 'Add rule' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RuleDialog;
