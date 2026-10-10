import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DeleteIcon from '@mui/icons-material/Delete';
import DiversityIcon from '@mui/icons-material/Diversity3';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import StatusChip from '../../../shared/components/StatusChip';
import ConfirmDialog, { useConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useAuth } from '../../../core/auth/AuthContext';
import { getApiErrorMessage } from '../../../core/api/errors';
import { teamsService } from '../services/teams.service';
import { tasksService } from '../../tasks/services/tasks.service';
import { usersService } from '../../users/services/users.service';

type TeamsTab = 'teams' | 'assignment';

interface TeamCard {
  id: string;
  name: string;
  focus: string;
  status: 'active' | 'inactive';
  members: string[];
}

function memberInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('');
}

/** Teams Management screen — live teams (`/api/v1/teams`) with create/delete. */
export function TeamsPage({ initialTab = 'teams' }: { initialTab?: TeamsTab } = {}) {
  const { can } = useAuth();
  const [tab, setTab] = useState<TeamsTab>(initialTab);
  const [teams, setTeams] = useState<TeamCard[]>([]);
  const [taskOptions, setTaskOptions] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [assignTeam, setAssignTeam] = useState('');
  const [assignTask, setAssignTask] = useState('');
  const [pendingDelete, setPendingDelete] = useState<TeamCard | null>(null);
  const deleteDialog = useConfirmDialog();

  const canCreate = can('teams:create');
  const canDelete = can('teams:delete');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ data }, usersRes, tasksRes] = await Promise.all([
        teamsService.list({ limit: 100 }),
        usersService.list({ limit: 100 }),
        tasksService.list({ limit: 100 }).catch(() => ({ data: [], pagination: undefined as never })),
      ]);
      const userNames = new Map(usersRes.data.map((u) => [u.id, u.name]));
      const detailed = await Promise.all(
        data.map((t) =>
          teamsService.get(t.id).catch(() => ({ ...t, members: [] as { id: string; name: string; email: string; role: string }[] })),
        ),
      );
      setTeams(
        detailed.map((t, i) => ({
          id: t.id,
          name: t.name,
          focus: t.description ?? data[i]?.description ?? '',
          status: t.status,
          members: (t.members ?? []).map((m) => m.name || userNames.get(m.id) || 'Unknown member'),
        })),
      );
      setTaskOptions((tasksRes.data ?? []).map((t) => ({ id: t.id, title: t.title || t.taskType })));
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
  const filtered = useMemo(
    () => teams.filter((t) => q.length === 0 || t.name.toLowerCase().includes(q)),
    [teams, q],
  );
  const totalMembers = useMemo(() => new Set(teams.flatMap((t) => t.members)).size, [teams]);

  async function handleCreate() {
    if (!name.trim()) {
      setNameError('Team name is required.');
      return;
    }
    setNameError(null);
    setCreating(true);
    try {
      const created = await teamsService.create({ name: name.trim(), description: focus.trim() || undefined });
      setFlash(`${created.name} created successfully.`);
      setName('');
      setFocus('');
      setDialogOpen(false);
      await load();
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await teamsService.deleteTeam(pendingDelete.id);
      setFlash(`Team “${pendingDelete.name}” deleted.`);
      await load();
    } catch (error) {
      setFlash(getApiErrorMessage(error));
    } finally {
      setPendingDelete(null);
      deleteDialog.hide();
    }
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            PEOPLE & CAPACITY • Organization
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Teams Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize delivery teams and staffing across the workspace. Live data from the backend.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {canCreate ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              New Team
            </Button>
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
            <Tabs value={tab} onChange={(_, value: TeamsTab) => setTab(value)} aria-label="Teams views" variant="scrollable" scrollButtons="auto">
              <Tab label={`Teams ${teams.length}`} value="teams" />
              <Tab label="Assignment" value="assignment" />
            </Tabs>
            <Typography variant="caption" color="text.secondary">
              {teams.length} teams • {totalMembers} assigned members
            </Typography>
          </Box>

          {tab === 'assignment' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720 }}>
              <Typography variant="body2" color="text.secondary">
                Staff tasks to the right team. There is no team→task endpoint yet, so quick assignments
                are recorded as a note — use Team Assignments for persisted member staffing.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl fullWidth sx={{ minWidth: 220 }}>
                  <InputLabel id="teams-assign-team-label">Team</InputLabel>
                  <Select labelId="teams-assign-team-label" label="Team" value={assignTeam} onChange={(e) => setAssignTeam(e.target.value)}>
                    {teams.map((t) => (
                      <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ minWidth: 220 }}>
                  <InputLabel id="teams-assign-task-label">Task</InputLabel>
                  <Select labelId="teams-assign-task-label" label="Task" value={assignTask} onChange={(e) => setAssignTask(e.target.value)}>
                    {taskOptions.map((t) => (
                      <MenuItem key={t.id} value={t.title}>{t.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  startIcon={<AssignmentIndIcon />}
                  disabled={!assignTeam || !assignTask}
                  onClick={() => setFlash(`${assignTask} noted for ${assignTeam} (no team→task endpoint yet — see Team Assignments for persisted staffing).`)}
                >
                  Assign team
                </Button>
              </Box>
            </Box>
          ) : null}

          {tab === 'teams' ? (
            <>
              <Box sx={{ mt: 2, maxWidth: 420 }}>
                <SearchField label="Search teams" placeholder="Search by team name" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} role="status" aria-label="Loading teams">
                  <CircularProgress />
                </Box>
              ) : loadError ? (
                <Alert severity="error" role="alert" sx={{ mt: 2 }} action={<Button color="inherit" size="small" onClick={() => void load()}>Retry</Button>}>
                  {loadError}
                </Alert>
              ) : filtered.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">
                  No teams found. {canCreate ? 'Create your first team to get started.' : ''}
                </Typography>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {filtered.map((team) => (
                    <Grid key={team.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }} aria-hidden>
                              <DiversityIcon />
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="body1" fontWeight={800} noWrap>
                                {team.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {team.focus || 'No focus set'}
                              </Typography>
                            </Box>
                            {canDelete ? (
                              <IconButton
                                size="small"
                                aria-label={`Delete team ${team.name}`}
                                onClick={() => {
                                  setPendingDelete(team);
                                  deleteDialog.show();
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            ) : null}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StatusChip label={team.status === 'active' ? 'Active' : 'Inactive'} tone={team.status === 'active' ? 'success' : 'default'} />
                            <Typography variant="caption" color="text.secondary">
                              {team.members.length} member{team.members.length === 1 ? '' : 's'}
                            </Typography>
                          </Box>
                          <AvatarGroup max={5} aria-label={`${team.members.length} members in ${team.name}`} sx={{ justifyContent: 'flex-start' }}>
                            {team.members.map((member) => (
                              <Avatar key={member} alt={member} sx={{ width: 30, height: 30, fontSize: '0.7rem' }}>
                                {memberInitials(member)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New team</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            id="team-name"
            label="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(nameError)}
            helperText={nameError ?? ' '}
            fullWidth
            required
            sx={{ mt: 0.5 }}
          />
          <TextField
            id="team-focus"
            label="Focus"
            placeholder="e.g. Brand systems & campaign visuals"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleCreate()} disabled={creating}>
            {creating ? 'Creating…' : 'Create team'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete this team?"
        message={pendingDelete ? `“${pendingDelete.name}” will be permanently deleted. Teams assigned to clients cannot be deleted.` : ''}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          deleteDialog.hide();
          setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
}

export default TeamsPage;
