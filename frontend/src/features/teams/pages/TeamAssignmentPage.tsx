import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PageContainer from '../../../shared/components/PageContainer';
import { MOCK_TEAMS } from '../mock/teams.mock';
import { MOCK_TASK_ROWS } from '../../tasks/mock/tasks.mock';

/** Team Assignment: pick a member team + task and assign — all local mock state. */
export function TeamAssignmentPage() {
  const [team, setTeam] = useState(MOCK_TEAMS[0].name);
  const [task, setTask] = useState(MOCK_TASK_ROWS[3].title);
  const [flash, setFlash] = useState<string | null>(null);

  function handleAssign() {
    setFlash(`${task} assigned to ${team} (local preview — not saved).`);
  }

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.1em' }} color="text.secondary">
            PEOPLE & CAPACITY • Staffing
          </Typography>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ mt: 0.5 }}>
            Team Assignment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Staff tasks to the right team. Assignments persist once backend planning lands.
          </Typography>
        </Box>
      </Box>

      {flash ? (
        <Alert severity="success" role="status" onClose={() => setFlash(null)}>
          {flash}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>Assignment details</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 720 }}>
            <FormControl fullWidth sx={{ minWidth: 220 }}>
              <InputLabel id="assign-team-label">Team</InputLabel>
              <Select labelId="assign-team-label" label="Team" value={team} onChange={(e) => setTeam(e.target.value)}>
                {MOCK_TEAMS.map((t) => (
                  <MenuItem key={t.id} value={t.name}>{t.name} — {t.lead}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ minWidth: 220 }}>
              <InputLabel id="assign-task-label">Task</InputLabel>
              <Select labelId="assign-task-label" label="Task" value={task} onChange={(e) => setTask(e.target.value)}>
                {MOCK_TASK_ROWS.map((t) => (
                  <MenuItem key={t.id} value={t.title}>{t.title} • {t.project}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<AssignmentIcon />} onClick={handleAssign}>
              Assign team
            </Button>
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default TeamAssignmentPage;
