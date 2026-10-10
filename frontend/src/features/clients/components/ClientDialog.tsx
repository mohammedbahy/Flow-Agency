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
  type ClientStatus,
  type MockClient,
} from '../types/clients.types';

interface ClientDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: MockClient | null;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void;
}

/** Shared client create/edit dialog with validation (local state only). */
export function ClientDialog({ open, mode, initial, onClose, onSubmit }: ClientDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [industry, setIndustry] = useState(initial?.industry ?? '');
  const [contactName, setContactName] = useState(initial?.contactName ?? '');
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? '');
  const [status, setStatus] = useState<ClientStatus>(initial?.status ?? 'active');
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const dialogKey = initial?.id ?? mode;
  const [lastKey, setLastKey] = useState(dialogKey);
  if (lastKey !== dialogKey) {
    setLastKey(dialogKey);
    setName(initial?.name ?? '');
    setIndustry(initial?.industry ?? '');
    setContactName(initial?.contactName ?? '');
    setContactEmail(initial?.contactEmail ?? '');
    setStatus(initial?.status ?? 'active');
    setErrors({});
  }

  function handleSubmit() {
    const nextErrors = validateClientForm({ name, industry, contactName, contactEmail, status });
    setErrors(nextErrors);
    if (nextErrors.name ?? nextErrors.contactEmail) return;
    onSubmit({
      name: name.trim(),
      industry: industry.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
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
              id="client-industry"
              label="Industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
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
          </Grid>
        </Grid>
        <TextField
          id="client-contact-name"
          label="Contact name"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          fullWidth
        />
        <TextField
          id="client-contact-email"
          label="Contact email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          error={Boolean(errors.contactEmail)}
          helperText={errors.contactEmail ?? ' '}
          fullWidth
          required
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'create' ? 'Add client' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClientDialog;
