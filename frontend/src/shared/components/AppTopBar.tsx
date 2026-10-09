import { useState } from 'react';
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
import { DEMO_USER } from './workspace';

interface AppTopBarProps {
  onMenuClick: () => void;
}

const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'Review requested', body: 'Mia Member submitted Homepage hero copy.', time: '12 min ago' },
  { id: 'n2', title: 'SLA breach', body: 'Apex Performance Creative Set missed its TikTok SLA.', time: '1 hr ago' },
  { id: 'n3', title: 'Approval granted', body: 'Sarah Miller approved the Brand voice one-pager.', time: '3 hrs ago' },
];

/** Workspace top bar: search, New menu, notifications, profile. Mock interactions only. */
export function AppTopBar({ onMenuClick }: AppTopBarProps) {
  const [newAnchor, setNewAnchor] = useState<HTMLElement | null>(null);
  const [bellAnchor, setBellAnchor] = useState<HTMLElement | null>(null);

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
          <IconButton aria-label="Notifications, 3 unread" onClick={(e) => setBellAnchor(e.currentTarget)} aria-haspopup="menu">
            <Badge badgeContent={3} color="error">
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
          {MOCK_NOTIFICATIONS.map((n) => (
            <MenuItem key={n.id} onClick={() => setBellAnchor(null)} sx={{ whiteSpace: 'normal' }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {n.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {n.body}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {n.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => setBellAnchor(null)}>
            <Typography variant="body2" color="primary" fontWeight={600}>
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, pl: 0.5 }}>
          <Avatar sx={{ bgcolor: kineticPalette.primary }}>{DEMO_USER.initials}</Avatar>
          <Box sx={{ lineHeight: 1.2 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {DEMO_USER.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {DEMO_USER.role}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default AppTopBar;
