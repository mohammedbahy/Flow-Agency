import { useState } from 'react';
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import {
  BACKEND_ROLE_LABEL,
  USER_STATUS_LABEL,
  type DirectoryUser,
  type UserStatus,
} from '../types/users.types';

const STATUS_TONE: Record<UserStatus, StatusTone> = {
  active: 'success',
  inactive: 'default',
};

const ROLE_TONE: Record<DirectoryUser['role'], StatusTone> = {
  admin: 'primary',
  account_manager: 'info',
  employee: 'default',
};

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

interface MembersTableProps {
  users: DirectoryUser[];
  selected: string[];
  canEdit: boolean;
  canChangeStatus: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (user: DirectoryUser) => void;
  onToggleStatus: (user: DirectoryUser) => void;
}

/** Team-members table: live API rows with team chips, role/status, row actions. */
export function MembersTable({
  users,
  selected,
  canEdit,
  canChangeStatus,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onToggleStatus,
}: MembersTableProps) {
  const [menuUser, setMenuUser] = useState<DirectoryUser | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  if (users.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">
        No users match your search or filters.
      </Typography>
    );
  }

  const allSelected = users.length > 0 && users.every((u) => selected.includes(u.id));

  return (
    <>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table aria-label="Team members">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={!allSelected && users.some((u) => selected.includes(u.id))}
                  onChange={onToggleSelectAll}
                  aria-label="Select all users on this page"
                />
              </TableCell>
              <TableCell>User Details</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Teams</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover selected={selected.includes(user.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.includes(user.id)}
                    onChange={() => onToggleSelect(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 200 }}>
                    <Avatar aria-hidden>{initialsOf(user.name)}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusChip label={BACKEND_ROLE_LABEL[user.role]} tone={ROLE_TONE[user.role]} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minWidth: 120 }}>
                    {user.teams.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        No team yet
                      </Typography>
                    ) : (
                      user.teams.slice(0, 2).map((team) => (
                        <Chip key={team} label={team} size="small" variant="outlined" />
                      ))
                    )}
                    {user.teams.length > 2 ? <Chip label={`+${user.teams.length - 2}`} size="small" /> : null}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {user.joinedAt}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip label={USER_STATUS_LABEL[user.status]} tone={STATUS_TONE[user.status]} />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label={`Actions for ${user.name}`}
                    aria-haspopup="menu"
                    disabled={!canEdit && !canChangeStatus}
                    onClick={(e) => {
                      setMenuUser(user);
                      setAnchor(e.currentTarget);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {canEdit ? (
          <MenuItem
            onClick={() => {
              if (menuUser) onEdit(menuUser);
              setAnchor(null);
            }}
          >
            Edit user
          </MenuItem>
        ) : null}
        {canChangeStatus ? (
          <MenuItem
            onClick={() => {
              if (menuUser) onToggleStatus(menuUser);
              setAnchor(null);
            }}
          >
            {menuUser?.status === 'active' ? 'Deactivate' : 'Activate'}
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}

export default MembersTable;
