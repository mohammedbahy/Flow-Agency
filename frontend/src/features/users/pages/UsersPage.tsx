import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import { RolesPanel, type LiveRoleEntry } from '../components/DirectoryPanels';
import MembersTable from '../components/MembersTable';
import UserDialog from '../components/UserDialog';
import { authService } from '../../authentication/services/auth.service';
import { teamsService } from '../../teams/services/teams.service';
import { usersService, type BackendRole, type BackendUserStatus } from '../services/users.service';
import {
  BACKEND_ROLES,
  usersToCsv,
  type DirectoryUser,
  type UserFormValues,
  type UsersTab,
  type UserStatus,
} from '../types/users.types';

const TAB_PARAM: Record<string, UsersTab> = {
  members: 'members',
  roles: 'roles',
};

const PAGE_SIZE_OPTIONS = [6, 10];

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

/** Users & Access Control screen — live directory (`GET /api/v1/users`) with server mutations. */
export function UsersPage() {
  const { can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: UsersTab = TAB_PARAM[searchParams.get('tab') ?? 'members'] ?? 'members';

  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | BackendRole>('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [teamOptions, setTeamOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; user: DirectoryUser | null } | null>(null);
  const [dialogBusy, setDialogBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [roleEntries, setRoleEntries] = useState<LiveRoleEntry[]>([]);

  const canCreate = can('users:create');
  const canUpdate = can('users:update');
  const canDeactivate = can('users:deactivate');
  const canChangeRole = can('users:change_role');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ data, pagination }, teams] = await Promise.all([
        usersService.list({ limit: 100 }),
        teamsService
          .list({ limit: 100 })
          .catch(() => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
      ]);
      const matrix = await authService.permissionsMatrix().catch(() => []);
      const teamNames = new Map<string, string[]>();
      for (const team of teams.data ?? []) {
        for (const memberId of team.members?.map((m) => m.id) ?? []) {
          teamNames.set(memberId, [...(teamNames.get(memberId) ?? []), team.name]);
        }
      }
      setUsers(
        data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          teams: teamNames.get(u.id) ?? [],
          joinedAt: formatDate(u.createdAt),
          mustChangePassword: u.mustChangePassword,
        })),
      );
      setTotal(pagination.total);
      setTeamOptions([...new Set((teams.data ?? []).map((t) => t.name))].sort());
      const memberCounts = new Map<string, number>();
      for (const u of data) {
        memberCounts.set(u.role, (memberCounts.get(u.role) ?? 0) + 1);
      }
      setRoleEntries(
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

  function setTab(next: UsersTab) {
    setSearchParams(next === 'members' ? {} : { tab: next });
    setPage(0);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        q.length === 0 || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return (
        matchesQuery &&
        (roleFilter === 'all' || u.role === roleFilter) &&
        (teamFilter === 'all' || u.teams.includes(teamFilter)) &&
        (statusFilter === 'all' || u.status === statusFilter)
      );
    });
  }, [users, query, roleFilter, teamFilter, statusFilter]);

  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);

  async function handleToggleStatus(user: DirectoryUser) {
    const next: BackendUserStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await usersService.changeStatus(user.id, next);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)));
      setFlash(`${user.name} ${next === 'active' ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    }
  }

  async function handleDialogSubmit(values: UserFormValues) {
    setDialogBusy(true);
    try {
      if (dialog?.mode === 'create') {
        const created = await usersService.create({
          name: values.name,
          email: values.email,
          role: values.role,
          password: values.password,
        });
        await load();
        setFlash(`Invite sent to ${created.name} — temporary password set, change required on first login.`);
      } else if (dialog?.user) {
        const previous = dialog.user;
        await usersService.update(previous.id, { name: values.name, email: values.email });
        if (values.role !== previous.role) {
          await usersService.changeRole(previous.id, values.role);
        }
        await load();
        setFlash(`${values.name} updated successfully.`);
      }
      setDialog(null);
      setPage(0);
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    } finally {
      setDialogBusy(false);
    }
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
    setFlash(`Exported ${filtered.length} users to CSV.`);
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
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportCsv} disabled={filtered.length === 0}>
            Export CSV
          </Button>
          {canCreate ? (
            <>
              <Button component={RouterLink} to="/users/new" variant="outlined" startIcon={<PersonAddIcon />}>
                Add User
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog({ mode: 'create', user: null })}>
                Invite Team Member
              </Button>
            </>
          ) : null}
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
              <Tab label={`Team Members ${total}`} value="members" />
              <Tab label="Roles & Permissions" value="roles" />
            </Tabs>
            <Typography variant="caption" color="text.secondary">
              Live directory • {total} users
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
                <FormControl size="medium" sx={{ minWidth: 170 }}>
                  <InputLabel id="role-filter-label">Role</InputLabel>
                  <Select labelId="role-filter-label" id="role-filter" label="Role" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value as 'all' | BackendRole); setPage(0); }}>
                    <MenuItem value="all">All Roles</MenuItem>
                    {BACKEND_ROLES.map((r) => (
                      <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="medium" sx={{ minWidth: 170 }}>
                  <InputLabel id="team-filter-label">Team</InputLabel>
                  <Select labelId="team-filter-label" id="team-filter" label="Team" value={teamFilter} onChange={(e) => { setTeamFilter(e.target.value); setPage(0); }}>
                    <MenuItem value="all">All Teams</MenuItem>
                    {teamOptions.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="medium" sx={{ minWidth: 140 }}>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select labelId="status-filter-label" id="status-filter" label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as 'all' | UserStatus); setPage(0); }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {selected.length > 0 ? (
                <Alert severity="info" sx={{ mb: 2 }} role="status">
                  {selected.length} user{selected.length === 1 ? '' : 's'} selected (bulk actions arrive in a future sprint).
                </Alert>
              ) : null}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading users">
                  <CircularProgress />
                </Box>
              ) : loadError ? (
                <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
                  {loadError}
                </Alert>
              ) : (
                <>
                  <MembersTable
                    users={visible}
                    selected={selected}
                    canEdit={canUpdate}
                    canChangeStatus={canDeactivate}
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
                    onEdit={(user) => (canChangeRole || canUpdate ? setDialog({ mode: 'edit', user }) : undefined)}
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
                </>
              )}
            </Box>
          ) : null}

          {tab === 'roles' ? (
            <Box sx={{ mt: 2 }}>
              <RolesPanel roles={roleEntries} />
            </Box>
          ) : null}
        </CardContent>
      </Card>

      {dialog ? (
        <UserDialog open mode={dialog.mode} initial={dialog.user} onClose={() => setDialog(null)} onSubmit={(v) => void handleDialogSubmit(v)} submitting={dialogBusy} />
      ) : null}
    </PageContainer>
  );
}

export default UsersPage;
