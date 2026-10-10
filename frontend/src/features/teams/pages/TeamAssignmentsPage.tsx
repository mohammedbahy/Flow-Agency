import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Slider,
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
import { MOCK_USERS } from '../../users/mock/users.mock';
import { USER_ROLES } from '../../users/types/users.types';
import { MOCK_ASSIGNMENTS, MOCK_PROJECTS_FOR_ASSIGNMENT } from '../mock/teams.mock';
import type { Assignment } from '../types/teams.types';

/** Team Assignment screen: assign members to projects with allocation. All local mock state. */
export function TeamAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [projectId, setProjectId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [role, setRole] = useState<string>(USER_ROLES[3]);
  const [allocation, setAllocation] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Assignment | null>(null);
  const removeDialog = useConfirmDialog();

  const activeMembers = MOCK_USERS.filter((u) => u.status === 'active');

  function handleAssign() {
    setError(null);
    if (!projectId) {
      setError('Select a project to assign the member to.');
      return;
    }
    if (!memberName) {
      setError('Select a team member to assign.');
      return;
    }
    if (assignments.some((a) => a.project === projectName(projectId) && a.memberName === memberName)) {
      setError(`${memberName} is already assigned to this project.`);
      return;
    }
    const project = MOCK_PROJECTS_FOR_ASSIGNMENT.find((p) => p.id === projectId);
    if (!project) return;
    const created: Assignment = {
      id: `local-${Date.now()}`,
      project: project.name,
      client: project.client,
      memberName,
      role,
      allocation,
    };
    setAssignments((prev) => [created, ...prev]);
    setFlash(`${memberName} assigned to ${project.name} at ${allocation}% (local preview — not saved).`);
    setProjectId('');
    setMemberName('');
    setAllocation(50);
  }

  function projectName(id: string): string {
    return MOCK_PROJECTS_FOR_ASSIGNMENT.find((p) => p.id === id)?.name ?? '';
  }

  function handleRemove() {
    if (!pendingRemoval) return;
    setAssignments((prev) => prev.filter((a) => a.id !== pendingRemoval.id));
    setFlash(`${pendingRemoval.memberName} removed from ${pendingRemoval.project} (local preview — not saved).`);
    setPendingRemoval(null);
    removeDialog.hide();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace • Staffing"
        title="Team Assignments"
        subtitle="Assign active team members to projects with an allocation. Changes are local preview state."
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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" component="h3">
                New assignment
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="assign-project-label">Project</InputLabel>
                <Select labelId="assign-project-label" id="assign-project" label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  {MOCK_PROJECTS_FOR_ASSIGNMENT.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} · {p.client}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="assign-member-label">Team member</InputLabel>
                <Select labelId="assign-member-label" id="assign-member" label="Team member" value={memberName} onChange={(e) => setMemberName(e.target.value)}>
                  {activeMembers.map((m) => (
                    <MenuItem key={m.id} value={m.name}>
                      {m.name} · {m.role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="assign-role-label">Assignment role</InputLabel>
                <Select labelId="assign-role-label" id="assign-role" label="Assignment role" value={role} onChange={(e) => setRole(e.target.value)}>
                  {USER_ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Typography variant="body2" fontWeight={600} gutterBottom component="label" htmlFor="assign-allocation">
                  Allocation: {allocation}%
                </Typography>
                <Slider id="assign-allocation" value={allocation} onChange={(_, v) => setAllocation(v as number)} step={5} min={5} max={100} aria-label="Allocation percent" />
              </Box>
              <Button variant="contained" onClick={handleAssign}>
                Assign member
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Current assignments ({assignments.length})
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table aria-label="Current assignments">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Member</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Allocation</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((a) => (
                      <TableRow key={a.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {a.project}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {a.client}
                          </Typography>
                        </TableCell>
                        <TableCell>{a.memberName}</TableCell>
                        <TableCell>{a.role}</TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={a.allocation} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} aria-label={`${a.memberName} allocation ${a.allocation} percent`} />
                            <Typography variant="caption" color="text.secondary">
                              {a.allocation}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label={`Remove ${a.memberName} from ${a.project}`}
                            onClick={() => {
                              setPendingRemoval(a);
                              removeDialog.show();
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={removeDialog.open}
        title="Remove this assignment?"
        message={pendingRemoval ? `${pendingRemoval.memberName} will be unassigned from ${pendingRemoval.project} in the local preview.` : ''}
        confirmLabel="Remove"
        confirmColor="error"
        onConfirm={handleRemove}
        onClose={() => {
          removeDialog.hide();
          setPendingRemoval(null);
        }}
      />
    </PageContainer>
  );
}

export default TeamAssignmentsPage;
