import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import StyleIcon from '@mui/icons-material/Style';
import DiversityIcon from '@mui/icons-material/Diversity3';
import FolderIcon from '@mui/icons-material/Folder';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import KeyIcon from '@mui/icons-material/Key';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import ChevronsLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronsRightIcon from '@mui/icons-material/ChevronRight';
import { NavLink, useLocation } from 'react-router-dom';
import { kineticPalette } from '../../core/theme/tokens';
import { PRODUCT_EDITION, PRODUCT_NAME } from './workspace';

export const SIDEBAR_WIDTH = 232;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

interface NavEntry {
  label: string;
  icon: ReactNode;
  to?: string;
  badge?: number;
  badgeTone?: 'default' | 'primary' | 'error';
  future?: boolean;
}

const MAIN_NAV: NavEntry[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard' },
  { label: 'Clients', icon: <BusinessIcon />, future: true },
  { label: 'Brands', icon: <StyleIcon />, future: true },
  { label: 'Teams', icon: <DiversityIcon />, future: true },
  { label: 'Projects', icon: <FolderIcon />, future: true },
  { label: 'Tasks', icon: <ChecklistIcon />, badge: 14, future: true },
  { label: 'My Tasks', icon: <PersonIcon />, future: true },
  { label: 'Content', icon: <ArticleIcon />, future: true },
  { label: 'Content Library', icon: <LibraryBooksIcon />, future: true },
  { label: 'Content Plans', icon: <CalendarMonthIcon />, future: true },
  { label: 'Reviews', icon: <RateReviewIcon />, to: '/reviews', badge: 4, badgeTone: 'primary' },
  { label: 'Analytics', icon: <AnalyticsIcon />, future: true },
];

const ADMIN_NAV: NavEntry[] = [
  { label: 'Notifications', icon: <NotificationsIcon />, badge: 9, badgeTone: 'error', future: true },
  { label: 'Users & Teams', icon: <ManageAccountsIcon />, to: '/users' },
  { label: 'Roles & Permissions', icon: <KeyIcon />, to: '/users?tab=roles' },
];

const UTILITY_NAV: NavEntry[] = [
  { label: 'Settings', icon: <SettingsIcon />, future: true },
  { label: 'Profile', icon: <AccountCircleIcon />, future: true },
  { label: 'Documentation', icon: <DescriptionIcon />, future: true },
];

function Badge({ value, tone }: { value: number; tone: NavEntry['badgeTone'] }) {
  const bg =
    tone === 'primary'
      ? kineticPalette.primary
      : tone === 'error'
        ? kineticPalette.error
        : '#E2E8F0';
  const color = tone === 'default' || tone === undefined ? kineticPalette.secondary : '#FFFFFF';
  return (
    <Typography
      variant="caption"
      fontWeight={700}
      sx={{
        bgcolor: bg,
        color,
        borderRadius: 999,
        px: 1,
        py: 0.25,
        fontSize: '0.7rem',
        lineHeight: 1.4,
      }}
    >
      {value}
    </Typography>
  );
}

function NavSection({
  title,
  entries,
  collapsed,
  current,
}: {
  title: string;
  entries: NavEntry[];
  collapsed: boolean;
  current: string;
}) {
  return (
    <>
      {!collapsed ? (
        <ListSubheader
          disableSticky
          sx={{ bgcolor: 'transparent', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          {title}
        </ListSubheader>
      ) : null}
      {entries.map((entry) => {
        const active = entry.to != null && (current === entry.to || current.startsWith(`${entry.to.split('?')[0]}/`));
        const button = (
          <ListItemButton
            key={entry.label}
            component={entry.to != null ? NavLink : 'button'}
            {...(entry.to != null ? { to: entry.to } : {})}
            disabled={entry.future}
            aria-label={entry.future ? `${entry.label} (coming in a future sprint)` : entry.label}
            title={collapsed ? entry.label : undefined}
            sx={{
              borderRadius: 2,
              mb: 0.25,
              color: active ? '#FFFFFF' : 'text.secondary',
              bgcolor: active ? kineticPalette.primary : 'transparent',
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': { bgcolor: active ? kineticPalette.primaryDark : kineticPalette.primaryLight },
              '&.active': { bgcolor: kineticPalette.primary, color: '#FFFFFF' },
              '&.Mui-disabled': { opacity: 0.75 },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
              {entry.icon}
            </ListItemIcon>
            {!collapsed ? (
              <>
                <ListItemText primary={entry.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }} />
                {entry.badge != null ? <Badge value={entry.badge} tone={entry.badgeTone} /> : null}
              </>
            ) : null}
          </ListItemButton>
        );
        return entry.future ? (
          <Tooltip key={entry.label} title="Available in a future sprint" placement="right">
            <span>{button}</span>
          </Tooltip>
        ) : (
          <Box key={entry.label}>{button}</Box>
        );
      })}
    </>
  );
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const current = `${location.pathname}${location.search}`;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }} onClick={onNavigate}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: collapsed ? 0 : 2,
          py: 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Avatar sx={{ bgcolor: kineticPalette.primary, borderRadius: 2, fontWeight: 800 }} variant="rounded" aria-hidden>
          A
        </Avatar>
        {!collapsed ? (
          <Box>
            <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
              {PRODUCT_NAME}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {PRODUCT_EDITION}
            </Typography>
          </Box>
        ) : null}
      </Box>
      <Divider />
      <List sx={{ px: collapsed ? 1 : 1.5, py: 1, overflowY: 'auto', flex: 1 }}>
        <NavSection title="Main" entries={MAIN_NAV} collapsed={collapsed} current={current} />
        <NavSection title="Administration" entries={ADMIN_NAV} collapsed={collapsed} current={current} />
        <Box sx={{ mt: 1 }}>
          <NavSection title="" entries={UTILITY_NAV} collapsed={collapsed} current={current} />
        </Box>
      </List>
      <Divider />
      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        <ListItemButton
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          sx={{ borderRadius: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center' }}>
            {collapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
          </ListItemIcon>
          {!collapsed ? <ListItemText primary="Collapse Menu" primaryTypographyProps={{ fontSize: '0.875rem' }} /> : null}
        </ListItemButton>
      </Box>
    </Box>
  );
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

/** AgencyOS workspace sidebar: permanent (collapsible) on desktop, drawer on mobile. */
export function AppSidebar({ mobileOpen, onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((c) => !c);
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH },
        }}
      >
        <SidebarContent collapsed={false} onToggleCollapse={toggle} onNavigate={onClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width,
            position: 'relative',
            transition: 'width 0.2s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={toggle} />
      </Drawer>
    </>
  );
}

export default AppSidebar;
