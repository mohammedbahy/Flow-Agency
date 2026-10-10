import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Tab, Tabs, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { RolesPanel } from '../components/DirectoryPanels';
import { MOCK_ROLES } from '../mock/users.mock';

/** Roles & Permissions directory: full-page view of the same role cards shown in Users — local mock state. */
export function RolesPage() {
  const [query, setQuery] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = MOCK_ROLES.filter(
    (r) => q.length === 0 || r.name.toLowerCase().includes(q) || r.permissions.some((p) => p.toLowerCase().includes(q)),
  );

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            GOVERNANCE & SECURITY • RBAC
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Roles & Permissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review role scopes and permission keys. Same data as the Users directory roles tab.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/users" variant="outlined">
            Back to Users List
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFlash('Role creation arrives with backend RBAC (local preview — not saved).')}>
            New Role
          </Button>
        </Box>
      </Box>

      {flash ? (
        <Alert severity="info" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Tabs value="roles" aria-label="Roles views" variant="scrollable" scrollButtons="auto">
              <Tab label={`Roles ${MOCK_ROLES.length}`} value="roles" />
            </Tabs>
            <Chip label={`${filtered.length} shown`} size="small" variant="outlined" />
          </Box>
          <Box sx={{ mt: 2, mb: 2, maxWidth: 420 }}>
            <SearchField label="Search roles" placeholder="Search roles or permissions" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          </Box>
          <RolesPanel roles={filtered} />
          {filtered.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }} role="status">
              No roles match “{query.trim()}” in this preview.
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default RolesPage;
