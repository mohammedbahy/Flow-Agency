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
import {
  DEADLINE_APPLIES_LABEL,
  validateDeadlineRule,
  type DeadlineRule,
  type DeadlineRuleErrors,
  type DeadlineRuleForm,
} from '../types/settings.types';

interface RuleDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: DeadlineRule | null;
  onClose: () => void;
  onSubmit: (values: DeadlineRuleForm) => void;
}

/** Shared deadline-rule create/edit dialog with validation (local state only). */
export function RuleDialog({ open, mode, initial, onClose, onSubmit }: RuleDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [appliesTo, setAppliesTo] = useState<DeadlineRuleForm['appliesTo']>(initial?.appliesTo ?? 'reviews');
  const [limit, setLimit] = useState(initial ? String(initial.limit) : '');
  const [unit, setUnit] = useState<DeadlineRuleForm['unit']>(initial?.unit ?? 'hours');
  const [action, setAction] = useState(initial?.action ?? '');
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [errors, setErrors] = useState<DeadlineRuleErrors>({});

  const dialogKey = initial?.id ?? mode;
  const [lastKey, setLastKey] = useState(dialogKey);
  if (lastKey !== dialogKey) {
    setLastKey(dialogKey);
    setName(initial?.name ?? '');
    setAppliesTo(initial?.appliesTo ?? 'reviews');
    setLimit(initial ? String(initial.limit) : '');
    setUnit(initial?.unit ?? 'hours');
    setAction(initial?.action ?? '');
    setEnabled(initial?.enabled ?? true);
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateDeadlineRule({ name, appliesTo, limit, unit, action, enabled });
    setErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.limit) return;
    onSubmit({ name: name.trim(), appliesTo, limit, unit, action: action.trim(), enabled });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add deadline rule' : 'Edit deadline rule'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          id="rule-name"
          label="Rule name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name ?? ' '}
          fullWidth
          required
          sx={{ mt: 0.5 }}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="rule-applies-label">Applies to</InputLabel>
              <Select labelId="rule-applies-label" id="rule-applies" label="Applies to" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as DeadlineRuleForm['appliesTo'])}>
                {(Object.keys(DEADLINE_APPLIES_LABEL) as DeadlineRuleForm['appliesTo'][]).map((key) => (
                  <MenuItem key={key} value={key}>
                    {DEADLINE_APPLIES_LABEL[key]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              id="rule-limit"
              label="Limit"
              inputMode="numeric"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              error={Boolean(errors.limit)}
              helperText={errors.limit ?? ' '}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="rule-unit-label">Unit</InputLabel>
              <Select labelId="rule-unit-label" id="rule-unit" label="Unit" value={unit} onChange={(e) => setUnit(e.target.value as DeadlineRuleForm['unit'])}>
                <MenuItem value="hours">Hours</MenuItem>
                <MenuItem value="days">Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <TextField
          id="rule-action"
          label="Escalation action"
          placeholder="e.g. Escalate to account lead"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          fullWidth
        />
        <FormControlLabel
          control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} id="rule-enabled" />}
          label="Rule enabled"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'create' ? 'Add rule' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RuleDialog;
