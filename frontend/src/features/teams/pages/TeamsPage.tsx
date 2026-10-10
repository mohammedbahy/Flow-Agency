import { useState } from 'react';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DiversityIcon from '@mui/icons-material/Diversity3';
import PageContainer from '../../../shared/components/PageContainer';
import SearchField from '../../../shared/components/SearchField';
import { MOCK_TEAMS } from '../mock/teams.mock';
import { MOCK_TASK_ROWS } from '../../tasks/mock/tasks.mock';
import type { MockTeam } from '../types/teams.types';

type TeamsTab = 'teams' | 'assignment';

/** Teams Management screen: team cards + assignment tab — all local mock state. */
export function TeamsPage({ initialTab = 'teams' }: { initialTab?: TeamsTab } = {}) {
  const [tab, setTab] = useState<TeamsTab>(initialTab);
  const [teams, setTeams] = useState<MockTeam[]>(MOCK_TEAMS);
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [assignTeam, setAssignTeam] = useState(MOCK_TEAMS[0].name);
  const [assignTask, setAssignTask] = useState(MOCK_TASK_ROWS[3].title);

  const q = query.trim().toLowerCase();
  const filtered = teams.filter(
    (t) => q.length === 0 || t.name.toLowerCase().includes(q) || t.lead.toLowerCase().includes(q),
  );
  const totalMembers = teams.reduce((sum, t) => sum + t.members, 0);

  function handleCreate() {
    if (!name.trim()) {
      setToast('Team name is required in this preview.');
      return;
    }
    const created: MockTeam = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      focus: focus.trim() || 'General delivery',
      members: 1,
      activeProjects: 0,
      lead: 'Elena Rostova',
      initials: ['ER'],
    };
    setTeams((prev) => [created, ...prev]);
    setFlash(`${created.name} created (local preview — not saved).`);
    setName('');
    setFocus('');
    setDialogOpen(false);
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
            Organize delivery teams, leads, and active project load across the workspace.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New Team
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
            <Tabs value={tab} onChange={(_, value: TeamsTab) => setTab(value)} aria-label="Teams views" variant="scrollable" scrollButtons="auto">
              <Tab label={`Teams ${teams.length}`} value="teams" />
              <Tab label="Assignment" value="assignment" />
            </Tabs>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`${teams.length} Teams`} variant="outlined" />
              <Chip label={`${totalMembers} Members`} variant="outlined" />
            </Box>
          </Box>

          {tab === 'assignment' ? (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 720 }}>
              <Typography variant="body2" color="text.secondary">
                Staff tasks to the right team. Assignments persist once backend planning lands.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl fullWidth sx={{ minWidth: 220 }}>
                  <InputLabel id="teams-assign-team-label">Team</InputLabel>
                  <Select labelId="teams-assign-team-label" label="Team" value={assignTeam} onChange={(e) => setAssignTeam(e.target.value)}>
                    {teams.map((t) => (
                      <MenuItem key={t.id} value={t.name}>{t.name} — {t.lead}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ minWidth: 220 }}>
                  <InputLabel id="teams-assign-task-label">Task</InputLabel>
                  <Select labelId="teams-assign-task-label" label="Task" value={assignTask} onChange={(e) => setAssignTask(e.target.value)}>
                    {MOCK_TASK_ROWS.map((t) => (
                      <MenuItem key={t.id} value={t.title}>{t.title} • {t.project}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Button variant="contained" startIcon={<AssignmentIndIcon />} onClick={() => setFlash(`${assignTask} assigned to ${assignTeam} (local preview — not saved).`)}>
                  Assign team
                </Button>
              </Box>
            </Box>
          ) : null}

          {tab === 'teams' ? (
          <>
          <Box sx={{ mt: 2, maxWidth: 420 }}>
            <SearchField label="Search teams" placeholder="Search by team or lead" value={query} onChange={(e) => setQuery(e.target.value)} fullWidth />
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {filtered.map((team) => (
              <Grid key={team.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <DiversityIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={800}>
                          {team.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lead: {team.lead}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {team.focus}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={`${team.members} members`} size="small" variant="outlined" />
                      <Chip label={`${team.activeProjects} projects`} size="small" variant="outlined" />
                    </Box>
                    <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                      {team.initials.map((initial) => (
                        <Avatar key={initial} sx={{ width: 30, height: 30, fontSize: '0.7rem' }}>
                          {initial}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filtered.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }} role="status">
              No teams match “{query.trim()}” in this preview.
            </Alert>
          ) : null}
          </>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New team (local preview)</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Team name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required sx={{ mt: 0.5 }} />
          <TextField label="Focus (e.g. Paid social & performance)" value={focus} onChange={(e) => setFocus(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained">
            Create team
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast !== null} autoHideDuration={3500} onClose={() => setToast(null)} message={toast} />
    </PageContainer>
  );
}

export default TeamsPage;
