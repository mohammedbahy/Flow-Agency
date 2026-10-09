import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import StatusChip from '../../../shared/components/StatusChip';
import { USER_STATUS_LABEL, type AuditEntry, type ClientUser, type RoleEntry } from '../types/users.types';

/** Client-users tab: external reviewers per client account. */
export function ClientUsersPanel({ users }: { users: ClientUser[] }) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table aria-label="Client users">
        <TableHead>
          <TableRow>
            <TableCell>User Details</TableCell>
            <TableCell>Client Account</TableCell>
            <TableCell>Last Active</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar aria-hidden>{user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{user.client}</TableCell>
              <TableCell>{user.lastActive}</TableCell>
              <TableCell>
                <StatusChip label={USER_STATUS_LABEL[user.status]} tone={user.status === 'active' ? 'success' : 'info'} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** Roles & permissions tab: role cards with permission keys. */
export function RolesPanel({ roles }: { roles: RoleEntry[] }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {roles.map((role) => (
        <Card key={role.id} variant="outlined">
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 180 }}>
              <Typography variant="subtitle1" fontWeight={700}>{role.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {role.members} member{role.members === 1 ? '' : 's'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1 }}>
              {role.permissions.map((permission) => (
                <Chip key={permission} label={permission} size="small" variant="outlined" />
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

/** Audit-log tab: recent governance events. */
export function AuditPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <List sx={{ py: 0 }}>
      {entries.map((entry) => (
        <ListItem key={entry.id} divider sx={{ px: 0 }}>
          <ListItemText
            primary={
              <Typography variant="body2">
                <strong>{entry.actor}</strong> {entry.action}
              </Typography>
            }
            secondary={entry.time}
          />
        </ListItem>
      ))}
    </List>
  );
}
