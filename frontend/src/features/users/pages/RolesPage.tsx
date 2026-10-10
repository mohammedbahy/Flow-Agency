import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { RolesPanel, type LiveRoleEntry } from '../components/DirectoryPanels';
import { getApiErrorMessage } from '../../../core/api/errors';
import { authService } from '../../authentication/services/auth.service';
import { usersService } from '../services/users.service';
import { BACKEND_ROLES } from '../types/users.types';

/** Roles & Permissions directory — live RBAC matrix with member counts. */
export function RolesPage() {
  const [query, setQuery] = useState('');
  const [roles, setRoles] = useState<LiveRoleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [matrix, usersRes] = await Promise.all([
        authService.permissionsMatrix(),
        usersService.list({ limit: 100 }),
      ]);
      const memberCounts = new Map<string, number>();
      for (const u of usersRes.data) {
        memberCounts.set(u.role, (memberCounts.get(u.role) ?? 0) + 1);
      }
      setRoles(
        matrix.map((row) => ({
          role: row.role,
          label: BACKEND_ROLES.find((r) => r.value === row.role)?.label ?? row.role,
          members: memberCounts.get(row.role) ?? 0,
          permissions: row.permissions,
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

  const q = query.trim().toLowerCase();
  const filtered = roles.filter(
    (r) => q.length === 0 || r.label.toLowerCase().includes(q) || r.permissions.some((p) => p.toLowerCase().includes(q)),
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
            Live role scopes from the backend permission matrix. Roles are fixed by the backend team.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button component={RouterLink} to="/users" variant="outlined">
            Back to Users List
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Tabs value="roles" aria-label="Roles views" variant="scrollable" scrollButtons="auto">
              <Tab label={`Roles ${roles.length}`} value="roles" />
            </Tabs>
            <Chip label={`${filtered.length} shown`} size="small" variant="outlined" />
          </Box>
          <Box sx={{ mt: 2, mb: 2, maxWidth: 420 }}>
            <SearchField label="Search roles" placeholder="Search roles or permissions" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading roles">
              <CircularProgress />
            </Box>
          ) : loadError ? (
            <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
              {loadError}
            </Alert>
          ) : (
            <>
              <RolesPanel roles={filtered} />
              {filtered.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }} role="status">
                  No roles match “{query.trim()}”.
                </Alert>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default RolesPage;
