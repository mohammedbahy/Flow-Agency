import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';

export interface LiveRoleEntry {
  role: string;
  label: string;
  members: number;
  permissions: string[];
}

/** Roles & permissions: live role cards with backend permission keys. */
export function RolesPanel({ roles }: { roles: LiveRoleEntry[] }) {
  if (roles.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No roles found.
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {roles.map((role) => (
        <Card key={role.role} variant="outlined">
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 180 }}>
              <Typography variant="subtitle1" fontWeight={700}>{role.label}</Typography>
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
