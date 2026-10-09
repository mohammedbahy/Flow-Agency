import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { MOCK_CLIENTS } from '../mock/clients.mock';

/** Client Management: account cards with search + local create note — all local mock state. */
export function ClientsPage() {
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const filtered = MOCK_CLIENTS.filter(
    (c) => q.length === 0 || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q),
  );

  const statusColor = (status: string) => (status === 'active' ? 'success' : status === 'at-risk' ? 'warning' : 'default');

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            RELATIONSHIPS • Accounts
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Client Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Retainers, contacts, and project load per client account.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setToast('Client creation arrives with backend CRM (local preview — not saved).')}>
          New Client
        </Button>
      </Box>

      {toast ? (
        <Alert severity="info" role="status" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ flexGrow: 1, minWidth: 220, maxWidth: 420 }}>
              <SearchField label="Search clients" placeholder="Search clients or contacts" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
            </Box>
            <Chip label={`${filtered.length} accounts`} variant="outlined" />
          </Box>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {filtered.map((client) => (
              <Grid key={client.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" fontWeight={800}>{client.name}</Typography>
                      <Chip label={client.status} size="small" color={statusColor(client.status) as 'success' | 'warning' | 'default'} variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">{client.contact}</Typography>
                    <Typography variant="body2">{client.retainer} • {client.projects} projects</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default ClientsPage;
