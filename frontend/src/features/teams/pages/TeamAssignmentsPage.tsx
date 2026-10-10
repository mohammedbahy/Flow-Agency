import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
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
import DeleteIcon from '@mui/icons-material/Delete';
import PageContainer from '../../../shared/components/PageContainer';
import PageHeader from '../../../shared/components/PageHeader';
import ConfirmDialog, { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import { teamsService } from '../services/teams.service';
import { usersService } from '../../users/services/users.service';

interface TeamOption {
  id: string;
  name: string;
}

interface MemberRow {
  userId: string;
  name: string;
  email: string;
}

interface AssignmentView {
  teamId: string;
  teamName: string;
  members: MemberRow[];
}

function memberInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('');
}

/** Team Assignments screen — staff live users into teams (`/api/v1/teams/:id/members`). */
export function TeamAssignmentsPage() {
  const { can } = useAuth();
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentView[]>([]);
  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [teamId, setTeamId] = useState('');
  const [userId, setUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<{ teamId: string; teamName: string; member: MemberRow } | null>(null);
  const removeDialog = useConfirmDialog();

  const canManage = can('teams:manage_members');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ data }, usersRes] = await Promise.all([
        teamsService.list({ limit: 100 }),
        usersService.list({ limit: 100 }),
      ]);
      const detailed = await Promise.all(data.map((t) => teamsService.get(t.id)));
      const nameById = new Map(usersRes.data.map((u) => [u.id, { name: u.name, email: u.email }]));
      setTeams(detailed.map((t) => ({ id: t.id, name: t.name })));
      setAssignments(
        detailed.map((t) => ({
          teamId: t.id,
          teamName: t.name,
          members: (t.members ?? []).map((m) => ({
            userId: m.id,
            name: m.name || nameById.get(m.id)?.name || 'Unknown member',
            email: m.email || nameById.get(m.id)?.email || '',
          })),
        })),
      );
      setUserOptions(
        usersRes.data.filter((u) => u.status === 'active').map((u) => ({ id: u.id, name: `${u.name} · ${u.role}` })),
      );
    } catch (err) {
      setLoadError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAssign() {
    setError(null);
    if (!teamId) {
      setError('Select a team to staff the member into.');
      return;
    }
    if (!userId) {
      setError('Select a team member to assign.');
      return;
    }
    const view = assignments.find((a) => a.teamId === teamId);
    if (view?.members.some((m) => m.userId === userId)) {
      setError('This member is already assigned to the selected team.');
      return;
    }
    setAssigning(true);
    try {
      await teamsService.addMembers(teamId, [userId]);
      setFlash('Member assigned successfully.');
      setTeamId('');
      setUserId('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemove() {
    if (!pendingRemoval) return;
    try {
      await teamsService.removeMember(pendingRemoval.teamId, pendingRemoval.member.userId);
      setFlash(`${pendingRemoval.member.name} removed from ${pendingRemoval.teamName}.`);
      await load();
    } catch (err) {
      setFlash(getApiErrorMessage(err));
    } finally {
      setPendingRemoval(null);
      removeDialog.hide();
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace • Staffing"
        title="Team Assignments"
        subtitle="Assign active users into teams. Changes persist to the backend immediately."
      />

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" role="alert" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading assignments">
          <CircularProgress />
        </Box>
      ) : loadError ? (
        <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" component="h3">
                  New assignment
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="assign-team-label">Team</InputLabel>
                  <Select labelId="assign-team-label" id="assign-team" label="Team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
                    {teams.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="assign-member-label">Team member</InputLabel>
                  <Select labelId="assign-member-label" id="assign-member" label="Team member" value={userId} onChange={(e) => setUserId(e.target.value)}>
                    {userOptions.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={() => void handleAssign()} disabled={assigning || !canManage}>
                  {assigning ? 'Assigning…' : 'Assign member'}
                </Button>
                {!canManage ? (
                  <Typography variant="caption" color="text.secondary">
                    Your role cannot manage team members.
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Current assignments
                </Typography>
                {assignments.map((view) => (
                  <Box key={view.teamId} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {view.teamName} ({view.members.length})
                    </Typography>
                    {view.members.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No members yet.
                      </Typography>
                    ) : (
                      <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table aria-label={`Members of ${view.teamName}`}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Member</TableCell>
                              {canManage ? <TableCell align="right">Actions</TableCell> : null}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {view.members.map((m) => (
                              <TableRow key={m.userId} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }} aria-hidden>
                                      {memberInitials(m.name)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" fontWeight={600}>
                                        {m.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {m.email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                {canManage ? (
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      aria-label={`Remove ${m.name} from ${view.teamName}`}
                                      onClick={() => {
                                        setPendingRemoval({ teamId: view.teamId, teamName: view.teamName, member: m });
                                        removeDialog.show();
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                ) : null}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={removeDialog.open}
        title="Remove this assignment?"
        message={pendingRemoval ? `${pendingRemoval.member.name} will be removed from ${pendingRemoval.teamName}.` : ''}
        confirmLabel="Remove"
        confirmColor="error"
        onConfirm={() => void handleRemove()}
        onClose={() => {
          removeDialog.hide();
          setPendingRemoval(null);
        }}
      />
    </PageContainer>
  );
}

export default TeamAssignmentsPage;
