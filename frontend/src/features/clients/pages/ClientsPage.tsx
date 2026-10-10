import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import SearchField from '../../../shared/components/SearchField';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import ClientDialog from '../components/ClientDialog';
import { clientsService } from '../services/clients.service';
import {
  CLIENT_STATUS_LABEL,
  type ClientFormValues,
  type ClientRow,
  type ClientStatus,
} from '../types/clients.types';

const STATUS_TONE: Record<ClientStatus, StatusTone> = {
  active: 'success',
  inactive: 'default',
};

function clientInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('');
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

/** Clients Management screen — live accounts (`/api/v1/clients`, admin only). */
export function ClientsPage() {
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; client: ClientRow | null } | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [menuClient, setMenuClient] = useState<ClientRow | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await clientsService.list({ limit: 100 });
      setClients(
        data.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description ?? '',
          email: c.email ?? '',
          phone: c.phone ?? '',
          status: c.status,
          createdAt: formatDate(c.createdAt),
        })),
      );
    } catch (error) {
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter(
      (c) =>
        (statusFilter === 'all' || c.status === statusFilter) &&
        (q.length === 0 || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)),
    );
  }, [clients, query, statusFilter]);

  async function handleDialogSubmit(values: ClientFormValues) {
    setDialogBusy(true);
    try {
      if (dialog?.mode === 'create') {
        const created = await clientsService.create({
          name: values.name,
          email: values.email || undefined,
          phone: values.phone || undefined,
          description: values.description || undefined,
          status: values.status,
        });
        setFlash(`${created.name} added successfully.`);
      } else if (dialog?.client) {
        const updated = await clientsService.update(dialog.client.id, {
          name: values.name,
          email: values.email || undefined,
          phone: values.phone || undefined,
          description: values.description || undefined,
          status: values.status,
        });
        setFlash(`${updated.name} updated successfully.`);
      }
      setDialog(null);
      await load();
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    } finally {
      setDialogBusy(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace • Client accounts"
        title="Clients Management"
        subtitle={`${filtered.length} of ${clients.length} clients · live data from the backend.`}
        actions={
          isAdmin ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'create', client: null })}>
              Add client
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Box sx={{ flexGrow: 2, minWidth: 220 }}>
              <SearchField
                label="Search clients"
                placeholder="Search by client or contact"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
              />
            </Box>
            <FormControl size="medium" sx={{ minWidth: 150 }}>
              <InputLabel id="client-status-filter-label">Status</InputLabel>
              <Select
                labelId="client-status-filter-label"
                id="client-status-filter"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | ClientStatus)}
              >
                <MenuItem value="all">All statuses</MenuItem>
                {(Object.keys(CLIENT_STATUS_LABEL) as ClientStatus[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {CLIENT_STATUS_LABEL[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading clients">
              <CircularProgress />
            </Box>
          ) : loadError ? (
            <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
              {loadError}
            </Alert>
          ) : filtered.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">
              No clients found. {isAdmin ? 'Add your first client to get started.' : ''}
            </Typography>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table aria-label="Clients">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    {isAdmin ? <TableCell align="right">Actions</TableCell> : null}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar aria-hidden>{clientInitials(client.name)}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {client.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.description || 'No description'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{client.email || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client.phone || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip label={CLIENT_STATUS_LABEL[client.status]} tone={STATUS_TONE[client.status]} />
                      </TableCell>
                      <TableCell>{client.createdAt}</TableCell>
                      {isAdmin ? (
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label={`Actions for ${client.name}`}
                            aria-haspopup="menu"
                            onClick={(e) => {
                              setMenuClient(client);
                              setAnchor(e.currentTarget);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem
          onClick={() => {
            if (menuClient) setDialog({ mode: 'edit', client: menuClient });
            setAnchor(null);
          }}
        >
          Edit client
        </MenuItem>
      </Menu>

      {dialog ? (
        <ClientDialog open mode={dialog.mode} initial={dialog.client} onClose={() => setDialog(null)} onSubmit={(v) => void handleDialogSubmit(v)} submitting={dialogBusy} />
      ) : null}
    </PageContainer>
  );
}

export default ClientsPage;
