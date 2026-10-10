import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  TablePagination,
  Tabs,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShieldIcon from '@mui/icons-material/Shield';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { AuditPanel, ClientUsersPanel, RolesPanel } from '../components/DirectoryPanels';
import MembersTable from '../components/MembersTable';
import UserDialog from '../components/UserDialog';
import { MOCK_AUDIT, MOCK_CLIENT_USERS, MOCK_ROLES, MOCK_USERS } from '../mock/users.mock';
import {
  USER_ROLES,
  USER_TEAMS,
  usersToCsv,
  type MockUser,
  type UserFormValues,
  type UsersTab,
  type UserStatus,
} from '../types/users.types';

const TAB_PARAM: Record<string, UsersTab> = {
  members: 'members',
  clients: 'clients',
  roles: 'roles',
  audit: 'audit',
};

const PAGE_SIZE_OPTIONS = [6, 10];

/** Users & Access Control screen: directory tabs, filters, table, invite — all local mock state. */
export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: UsersTab = TAB_PARAM[searchParams.get('tab') ?? 'members'] ?? 'members';

  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; user: MockUser | null } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  function setTab(next: UsersTab) {
    setSearchParams(next === 'members' ? {} : { tab: next });
    setPage(0);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        q.length === 0 ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return (
        matchesQuery &&
        (roleFilter === 'all' || u.role === roleFilter) &&
        (teamFilter === 'all' || u.team === teamFilter) &&
        (statusFilter === 'all' || u.status === statusFilter)
      );
    });
  }, [users, query, roleFilter, teamFilter, statusFilter]);

  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const twoFactorRate = Math.round((users.filter((u) => u.twoFactor).length / Math.max(users.length, 1)) * 100);

  function handleToggleStatus(user: MockUser) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u,
      ),
    );
    setFlash(`${user.name} ${user.status === 'active' ? 'suspended' : 'activated'} (local preview — not saved).`);
  }

  function handleDialogSubmit(values: UserFormValues) {
    if (dialog?.mode === 'create') {
      const created: MockUser = {
        id: `local-${Date.now()}`,
        status: 'invited',
        clients: ['Unassigned'],
        lastActive: 'Never (Invited)',
        twoFactor: false,
        ...values,
      };
      setUsers((prev) => [created, ...prev]);
      setFlash(`Invite sent to ${created.name} (local preview — not saved).`);
    } else if (dialog?.user) {
      setUsers((prev) => prev.map((u) => (u.id === dialog.user?.id ? { ...u, ...values } : u)));
      setFlash(`${values.name} updated (local preview — not saved).`);
    }
    setDialog(null);
    setPage(0);
  }

  function handleExportCsv() {
    const csv = usersToCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-export.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFlash(`Exported ${filtered.length} users to CSV (generated from local preview data).`);
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            GOVERNANCE & SECURITY • Access Management
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Users & Access Control
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage agency team members, client collaborators, and role-based permissions across all workspace modules.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button component={RouterLink} to="/users/new" variant="outlined" startIcon={<PersonAddIcon />}>
            Add User
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'create', user: null })}>
            Invite Team Member
          </Button>
        </Box>
      </Box>

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Tabs value={tab} onChange={(_, value: UsersTab) => setTab(value)} aria-label="Directory views" variant="scrollable" scrollButtons="auto">
              <Tab label={`Team Members ${users.length}`} value="members" />
              <Tab label={`Client Users ${MOCK_CLIENT_USERS.length}`} value="clients" />
              <Tab label={`Roles & Permissions ${MOCK_ROLES.length}`} value="roles" />
              <Tab label="Audit Logs" value="audit" />
            </Tabs>
            <Typography variant="caption" color="text.secondary">
              Sync: Realtime • Active Workspaces: 6
            </Typography>
          </Box>

          {tab === 'members' ? (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box sx={{ flexGrow: 2, minWidth: 220 }}>
                  <SearchField
                    label="Search users"
                    placeholder="Search by name or email"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(0);
                    }}
                    fullWidth
                  />
                </Box>
                <FormControl size="medium" sx={{ minWidth: 150 }}>
                  <InputLabel id="role-filter-label">Role</InputLabel>
                  <Select labelId="role-filter-label" id="role-filter" label="Role" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
                    <MenuItem value="all">All Roles</MenuItem>
                    {USER_ROLES.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="medium" sx={{ minWidth: 170 }}>
                  <InputLabel id="team-filter-label">Team</InputLabel>
                  <Select labelId="team-filter-label" id="team-filter" label="Team" value={teamFilter} onChange={(e) => { setTeamFilter(e.target.value); setPage(0); }}>
                    <MenuItem value="all">All Teams</MenuItem>
                    {USER_TEAMS.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="medium" sx={{ minWidth: 140 }}>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select labelId="status-filter-label" id="status-filter" label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as 'all' | UserStatus); setPage(0); }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="invited">Invited</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
                <Chip icon={<ShieldIcon />} label={`${twoFactorRate}% Compliant 2FA Enforced`} color="success" variant="outlined" />
                <Chip label={`${users.length} Total Across 12 brands`} variant="outlined" />
              </Box>

              {selected.length > 0 ? (
                <Alert severity="info" sx={{ mb: 2 }} role="status">
                  {selected.length} user{selected.length === 1 ? '' : 's'} selected (bulk actions arrive in a future sprint).
                </Alert>
              ) : null}

              <MembersTable
                users={visible}
                selected={selected}
                onToggleSelect={(id) =>
                  setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
                }
                onToggleSelectAll={() =>
                  setSelected((prev) => {
                    const ids = visible.map((u) => u.id);
                    return ids.every((id) => prev.includes(id))
                      ? prev.filter((id) => !ids.includes(id))
                      : [...new Set([...prev, ...ids])];
                  })
                }
                onEdit={(user) => setDialog({ mode: 'edit', user })}
                onToggleStatus={handleToggleStatus}
              />
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                rowsPerPage={pageSize}
                rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                onPageChange={(_, next) => setPage(next)}
                onRowsPerPageChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                labelDisplayedRows={({ from, to, count }) => `Showing ${from}–${to} of ${count} users`}
              />
            </Box>
          ) : null}

          {tab === 'clients' ? (
            <Box sx={{ mt: 2 }}>
              <ClientUsersPanel users={MOCK_CLIENT_USERS} />
            </Box>
          ) : null}
          {tab === 'roles' ? (
            <Box sx={{ mt: 2 }}>
              <RolesPanel roles={MOCK_ROLES} />
            </Box>
          ) : null}
          {tab === 'audit' ? (
            <Box sx={{ mt: 2 }}>
              <AuditPanel entries={MOCK_AUDIT} />
            </Box>
          ) : null}
        </CardContent>
      </Card>

      {dialog ? (
        <UserDialog open mode={dialog.mode} initial={dialog.user} onClose={() => setDialog(null)} onSubmit={handleDialogSubmit} />
      ) : null}
    </PageContainer>
  );
}

export default UsersPage;
