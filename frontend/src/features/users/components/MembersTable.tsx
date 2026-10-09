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
  Tooltip,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ShieldIcon from '@mui/icons-material/Shield';
import StatusChip, { type StatusTone } from '../../../shared/components/StatusChip';
import { USER_STATUS_LABEL, type MockUser, type UserStatus } from '../types/users.types';

const STATUS_TONE: Record<UserStatus, StatusTone> = {
  active: 'success',
  invited: 'info',
  suspended: 'default',
};

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
}

interface MembersTableProps {
  users: MockUser[];
  selected: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (user: MockUser) => void;
  onToggleStatus: (user: MockUser) => void;
}

/** Team-members table: select, user details, role, clients, 2FA, activity, status, actions. */
export function MembersTable({
  users,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onToggleStatus,
}: MembersTableProps) {
  const [menuUser, setMenuUser] = useState<MockUser | null>(null);
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
              <TableCell>Assigned Clients & Teams</TableCell>
              <TableCell>Security</TableCell>
              <TableCell>Last Active</TableCell>
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
                      <Typography variant="caption" color="text.secondary" display="block" noWrap>
                        {user.team}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusChip label={user.role} tone="info" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minWidth: 140 }}>
                    {user.clients.slice(0, 2).map((client) => (
                      <Chip key={client} label={client} size="small" variant="outlined" />
                    ))}
                    {user.clients.length > 2 ? <Chip label={`+${user.clients.length - 2}`} size="small" /> : null}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title={user.twoFactor ? 'Two-factor authentication enforced' : 'Two-factor authentication off'}>
                    <ShieldIcon color={user.twoFactor ? 'success' : 'disabled'} aria-label={user.twoFactor ? `2FA enforced for ${user.name}` : `2FA off for ${user.name}`} />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {user.lastActive}
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
        <MenuItem
          onClick={() => {
            if (menuUser) onEdit(menuUser);
            setAnchor(null);
          }}
        >
          Edit user
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) onToggleStatus(menuUser);
            setAnchor(null);
          }}
        >
          {menuUser?.status === 'active' ? 'Suspend' : 'Activate'}
        </MenuItem>
      </Menu>
    </>
  );
}

export default MembersTable;
