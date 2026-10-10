import { useEffect, useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { kineticPalette } from '../../core/theme/tokens';
import { useAuth } from '../../core/auth/AuthContext';
import { tasksService, type DelayedTaskItem } from '../../features/tasks/services/tasks.service';
import { Link as RouterLink } from 'react-router-dom';

interface AppTopBarProps {
  onMenuClick: () => void;
}

/** Workspace top bar: search, New menu, live notifications, live profile menu. */
export function AppTopBar({ onMenuClick }: AppTopBarProps) {
  const { user, logout } = useAuth();
  const [newAnchor, setNewAnchor] = useState<HTMLElement | null>(null);
  const [bellAnchor, setBellAnchor] = useState<HTMLElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<DelayedTaskItem[]>([]);
  const [notificationTotal, setNotificationTotal] = useState(0);

  // Live overdue items power the notification center (no notification API yet).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    tasksService
      .delayed({ limit: 5 })
      .then((res) => {
        if (cancelled) return;
        setNotifications(res.items ?? []);
        setNotificationTotal(res.pagination?.total ?? 0);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayName = user?.name ?? 'Signed out';
  const displayRole = user?.role ?? '';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid #E6E8F5' }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton edge="start" onClick={onMenuClick} aria-label="Open navigation menu" sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <TextField
          placeholder="Search workspace…"
          size="small"
          sx={{ flexGrow: 1, maxWidth: 520 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ border: '1px solid #E2E8F0', borderRadius: 1, px: 0.75, py: 0.25 }}
                  >
                    ⌘K
                  </Typography>
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': 'Search workspace (decorative in this preview)' },
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={(e) => setNewAnchor(e.currentTarget)} aria-haspopup="menu">
          New
        </Button>
        <Menu anchorEl={newAnchor} open={Boolean(newAnchor)} onClose={() => setNewAnchor(null)}>
          <MenuItem disabled>New Project (future sprint)</MenuItem>
          <MenuItem disabled>New Task (future sprint)</MenuItem>
          <MenuItem disabled>New Client (future sprint)</MenuItem>
        </Menu>
        <Tooltip title="Notifications">
          <IconButton aria-label={`Notifications, ${notificationTotal} unread`} onClick={(e) => setBellAnchor(e.currentTarget)} aria-haspopup="menu">
            <Badge badgeContent={notificationTotal} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={bellAnchor}
          open={Boolean(bellAnchor)}
          onClose={() => setBellAnchor(null)}
          slotProps={{ paper: { sx: { width: 340 } } }}
        >
          {notifications.length === 0 ? (
            <MenuItem onClick={() => setBellAnchor(null)}>
              <Typography variant="body2" color="text.secondary">
                All clear — nothing overdue right now.
              </Typography>
            </MenuItem>
          ) : (
            notifications.map((n) => (
              <MenuItem key={n.id} onClick={() => setBellAnchor(null)} sx={{ whiteSpace: 'normal' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Overdue: {n.title || n.taskType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {n.client?.name ?? 'No client'} · {n.daysOverdue}d overdue
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          <Divider />
          <MenuItem component={RouterLink} to="/tasks/delayed" onClick={() => setBellAnchor(null)}>
            <Typography variant="body2" color="primary" fontWeight={600}>
              View all overdue tasks
            </Typography>
          </MenuItem>
        </Menu>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, pl: 0.5 }}>
          <Tooltip title={displayName}>
            <IconButton
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              aria-label="Account menu"
              aria-haspopup="menu"
              sx={{ p: 0 }}
            >
              <Avatar sx={{ bgcolor: kineticPalette.primary }}>{initials}</Avatar>
            </IconButton>
          </Tooltip>
          <Box sx={{ lineHeight: 1.2 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {displayRole}
            </Typography>
          </Box>
        </Box>
        <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)}>
          <MenuItem
            component={RouterLink}
            to="/profile"
            onClick={() => setProfileAnchor(null)}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              setProfileAnchor(null);
              logout();
            }}
          >
            Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default AppTopBar;
