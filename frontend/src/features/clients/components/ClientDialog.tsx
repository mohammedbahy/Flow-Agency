import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  CLIENT_STATUS_LABEL,
  validateClientForm,
  type ClientFormErrors,
  type ClientFormValues,
  type ClientRow,
  type ClientStatus,
} from '../types/clients.types';

interface ClientDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ClientRow | null;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void;
  submitting?: boolean;
}

/** Shared client create/edit dialog — fields mirror `POST /api/v1/clients`. */
export function ClientDialog({ open, mode, initial, onClose, onSubmit, submitting = false }: ClientDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? 'active');
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const dialogKey = initial?.id ?? mode;
  const [lastKey, setLastKey] = useState(dialogKey);
  if (lastKey !== dialogKey) {
    setLastKey(dialogKey);
    setName(initial?.name ?? '');
    setEmail(initial?.email ?? '');
    setPhone(initial?.phone ?? '');
    setDescription(initial?.description ?? '');
    setStatus(initial?.status ?? 'active');
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateClientForm({ name, email, phone, description, status });
    setErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.email) return;
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      description: description.trim(),
      status,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add client' : 'Edit client'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          id="client-name"
          label="Client name"
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
            <TextField
              id="client-email"
              label="Contact email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email ?? ' '}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id="client-phone"
              label="Contact phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
        <TextField
          id="client-description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
        <FormControl fullWidth sx={{ maxWidth: 240 }}>
          <InputLabel id="client-status-label">Status</InputLabel>
          <Select
            labelId="client-status-label"
            id="client-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
          >
            {(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map((s) => (
              <MenuItem key={s} value={s}>
                {CLIENT_STATUS_LABEL[s]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {mode === 'create' ? 'Add client' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClientDialog;
