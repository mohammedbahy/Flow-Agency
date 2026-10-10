import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import ClientDialog from '../components/ClientDialog';
import { MOCK_CLIENTS } from '../mock/clients.mock';
import {
  CLIENT_STATUS_LABEL,
  type ClientFormValues,
  type ClientStatus,
  type MockClient,
} from '../types/clients.types';

const STATUS_TONE: Record<ClientStatus, StatusTone> = {
  active: 'success',
  'at-risk': 'warning',
  paused: 'default',
};

function clientInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('');
}

/** Clients Management screen: directory table, filters, create/edit dialogs. All local mock state. */
export function ClientsPage() {
  const [clients, setClients] = useState<MockClient[]>(MOCK_CLIENTS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all');
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; client: MockClient | null } | null>(null);
  const [menuClient, setMenuClient] = useState<MockClient | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter(
      (c) =>
        (statusFilter === 'all' || c.status === statusFilter) &&
        (q.length === 0 || c.name.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q)),
    );
  }, [clients, query, statusFilter]);

  function handleDialogSubmit(values: ClientFormValues) {
    if (dialog?.mode === 'create') {
      const created: MockClient = { id: `local-${Date.now()}`, brands: [], activeProjects: 0, ...values };
      setClients((prev) => [created, ...prev]);
      setFlash(`${created.name} added (local preview — not saved).`);
    } else if (dialog?.client) {
      setClients((prev) => prev.map((c) => (c.id === dialog.client?.id ? { ...c, ...values } : c)));
      setFlash(`${values.name} updated (local preview — not saved).`);
    }
    setDialog(null);
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace • Client accounts"
        title="Clients Management"
        subtitle={`${filtered.length} of ${clients.length} clients · changes are local preview state.`}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'create', client: null })}>
            Add client
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

          {filtered.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">
              No clients match your search or filters.
            </Typography>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table aria-label="Clients">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Brands</TableCell>
                    <TableCell>Active Projects</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
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
                              {client.industry || 'Industry not set'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{client.contactName || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client.contactEmail}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {client.brands.length === 0 ? (
                            <Typography variant="caption" color="text.secondary">No brands yet</Typography>
                          ) : (
                            client.brands.map((brand) => <Chip key={brand} label={brand} size="small" variant="outlined" />)
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{client.activeProjects}</TableCell>
                      <TableCell>
                        <StatusChip label={CLIENT_STATUS_LABEL[client.status]} tone={STATUS_TONE[client.status]} />
                      </TableCell>
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
        <ClientDialog open mode={dialog.mode} initial={dialog.client} onClose={() => setDialog(null)} onSubmit={handleDialogSubmit} />
      ) : null}
    </PageContainer>
  );
}

export default ClientsPage;
