import {
  Avatar,
  Box,
  Collapse,
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
import { useEffect, useState, type ReactNode } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import StyleIcon from '@mui/icons-material/Style';
import DiversityIcon from '@mui/icons-material/Diversity3';
import FolderIcon from '@mui/icons-material/Folder';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ArticleIcon from '@mui/icons-material/Article';
import RateReviewIcon from '@mui/icons-material/RateReview';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import KeyIcon from '@mui/icons-material/Key';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import ChevronsLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronsRightIcon from '@mui/icons-material/ChevronRight';
import { NavLink, useLocation } from 'react-router-dom';
import { kineticPalette } from '../../core/theme/tokens';
import { PRODUCT_EDITION, PRODUCT_NAME } from './workspace';
import { useAuth } from '../../core/auth/AuthContext';
import { reviewsService } from '../../features/reviews/services/reviews.service';
import { tasksService } from '../../features/tasks/services/tasks.service';

export const SIDEBAR_WIDTH = 232;
export const SIDEBAR_COLLAPSED_WIDTH = 76;

interface NavEntry {
  kind: 'link';
  label: string;
  icon: ReactNode;
  to?: string;
  badge?: number;
  /** Live count source (fetched once per sidebar mount when signed in). */
  liveBadge?: 'delayed' | 'reviews';
  badgeTone?: 'default' | 'primary' | 'error';
  future?: boolean;
}

interface NavGroup {
  kind: 'group';
  label: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  children: NavEntry[];
}

type NavNode = NavEntry | NavGroup;

const OVERVIEW_NAV: NavNode[] = [
  { kind: 'link', label: 'Dashboard', icon: <DashboardIcon />, to: '/dashboard' },
  { kind: 'link', label: 'Agency Overview', icon: <DashboardIcon />, to: '/agency' },
];

const CLIENTS_NAV: NavNode[] = [
  { kind: 'link', label: 'Clients', icon: <BusinessIcon />, to: '/clients' },
  { kind: 'link', label: 'Brand Performance', icon: <StyleIcon />, to: '/brand-performance' },
];

const DELIVERY_NAV: NavNode[] = [
  { kind: 'link', label: 'Projects', icon: <FolderIcon />, future: true },
  {
    kind: 'group',
    label: 'Tasks',
    icon: <ChecklistIcon />,
    defaultOpen: true,
    children: [
      { kind: 'link', label: 'All Tasks', icon: <ChecklistIcon />, to: '/tasks' },
      { kind: 'link', label: 'Delayed Tasks', icon: <ChecklistIcon />, to: '/tasks/delayed', liveBadge: 'delayed', badgeTone: 'error' },
      { kind: 'link', label: 'Completed Tasks', icon: <ChecklistIcon />, to: '/tasks/completed' },
      { kind: 'link', label: 'Completion Rate', icon: <ChecklistIcon />, to: '/tasks/completion' },
    ],
  },
  { kind: 'link', label: 'Reviews', icon: <RateReviewIcon />, to: '/reviews', liveBadge: 'reviews', badgeTone: 'primary' },
];

const TEAMS_NAV: NavNode[] = [
  { kind: 'link', label: 'Teams', icon: <DiversityIcon />, to: '/teams' },
  { kind: 'link', label: 'Team Assignments', icon: <AssignmentIndIcon />, to: '/team/assignments' },
];

const CONTENT_NAV: NavNode[] = [
  { kind: 'link', label: 'Content', icon: <ArticleIcon />, future: true },
];

const ADMIN_NAV: NavNode[] = [
  { kind: 'link', label: 'Users & Teams', icon: <ManageAccountsIcon />, to: '/users' },
  { kind: 'link', label: 'Roles & Permissions', icon: <KeyIcon />, to: '/roles' },
  { kind: 'link', label: 'Notifications', icon: <NotificationsIcon />, future: true },
];

const UTILITY_NAV: NavNode[] = [
  {
    kind: 'group',
    label: 'Settings',
    icon: <SettingsIcon />,
    children: [
      { kind: 'link', label: 'Agency Settings', icon: <SettingsIcon />, to: '/settings/agency' },
      { kind: 'link', label: 'Profile Settings', icon: <SettingsIcon />, to: '/settings/profile' },
      { kind: 'link', label: 'Deadline Rules', icon: <SettingsIcon />, to: '/settings/deadline-rules' },
      { kind: 'link', label: 'Workspace Settings', icon: <SettingsIcon />, to: '/settings' },
    ],
  },
  { kind: 'link', label: 'Profile', icon: <AccountCircleIcon />, to: '/profile' },
  { kind: 'link', label: 'Documentation', icon: <DescriptionIcon />, future: true },
];

function routePath(to: string): string {
  return to.split('?')[0];
}

function isActive(current: string, to: string): boolean {
  const path = routePath(to);
  if (current === to || current === path) return true;
  return current.startsWith(`${path}/`);
}

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
      sx={{ bgcolor: bg, color, borderRadius: 999, px: 1, py: 0.25, fontSize: '0.7rem', lineHeight: 1.4 }}
    >
      {value}
    </Typography>
  );
}

function NavLinkButton({
  entry,
  collapsed,
  current,
  liveCounts,
}: {
  entry: NavEntry;
  collapsed: boolean;
  current: string;
  liveCounts: Record<string, number>;
}) {
  const active = entry.to != null && isActive(current, entry.to);
  const badgeValue = entry.liveBadge ? liveCounts[entry.liveBadge] : entry.badge;
  const button = (
    <ListItemButton
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
          <ListItemText
            primary={entry.label}
            primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}
          />
          {badgeValue != null && badgeValue > 0 ? <Badge value={badgeValue} tone={entry.badgeTone} /> : null}
        </>
      ) : null}
    </ListItemButton>
  );
  return entry.future ? (
    <Tooltip title="Available in a future sprint" placement="right">
      <span>{button}</span>
    </Tooltip>
  ) : (
    button
  );
}

function NavSection({
  title,
  nodes,
  collapsed,
  current,
  openGroups,
  onToggleGroup,
  liveCounts,
}: {
  title: string;
  nodes: NavNode[];
  collapsed: boolean;
  current: string;
  openGroups: Record<string, boolean>;
  onToggleGroup: (label: string) => void;
  liveCounts: Record<string, number>;
}) {
  // Collapsed rail: flatten groups into their links.
  const flat: NavEntry[] = collapsed
    ? nodes.flatMap((node) => (node.kind === 'group' ? node.children : [node]))
    : [];

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
      {collapsed
        ? flat.map((entry) => (
            <NavLinkButton key={entry.label} entry={entry} collapsed current={current} liveCounts={liveCounts} />
          ))
        : nodes.map((node) => {
            if (node.kind === 'link') {
              return <NavLinkButton key={node.label} entry={node} collapsed={false} current={current} liveCounts={liveCounts} />;
            }
            const open = openGroups[node.label] ?? node.defaultOpen ?? false;
            const childActive = node.children.some((c) => c.to != null && isActive(current, c.to));
            return (
              <Box key={node.label}>
                <ListItemButton
                  onClick={() => onToggleGroup(node.label)}
                  aria-expanded={open}
                  aria-label={`${node.label} section`}
                  sx={{
                    borderRadius: 2,
                    mb: 0.25,
                    color: childActive ? kineticPalette.primary : 'text.secondary',
                    fontWeight: childActive ? 600 : 500,
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{node.icon}</ListItemIcon>
                  <ListItemText primary={node.label} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                  {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 2 }}>
                    {node.children.map((child) => (
                      <NavLinkButton key={child.label} entry={child} collapsed={false} current={current} liveCounts={liveCounts} />
                    ))}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
    </>
  );
}

const ALL_GROUPS: NavNode[] = [...OVERVIEW_NAV, ...CLIENTS_NAV, ...DELIVERY_NAV, ...TEAMS_NAV, ...CONTENT_NAV, ...ADMIN_NAV, ...UTILITY_NAV];

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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      if (label in prev) return { ...prev, [label]: !prev[label] };
      const node = ALL_GROUPS.find((n): n is NavGroup => n.kind === 'group' && n.label === label);
      return { ...prev, [label]: !(node?.defaultOpen ?? false) };
    });
  }

  const { user } = useAuth();
  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

  // Live queue badges (overdue tasks, pending reviews).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      tasksService.delayed({ limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
      reviewsService.list({ status: 'pending', limit: 1 }).catch(() => ({ pagination: { total: 0 } })),
    ])
      .then(([delayed, reviews]) => {
        if (cancelled) return;
        setLiveCounts({ delayed: delayed.pagination.total, reviews: reviews.pagination.total });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user]);

  const sectionProps = { collapsed, current, openGroups, onToggleGroup: toggleGroup, liveCounts };

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
        <Avatar
          sx={{ bgcolor: '#FFFFFF', borderRadius: 2, fontWeight: 800 }}
          variant="rounded"
          aria-hidden
          src="/neurteq-icon.svg"
          alt="Neurteq"
        >
          N
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
        <NavSection title="Overview" nodes={OVERVIEW_NAV} {...sectionProps} />
        <NavSection title="Clients & Brands" nodes={CLIENTS_NAV} {...sectionProps} />
        <NavSection title="Delivery" nodes={DELIVERY_NAV} {...sectionProps} />
        <NavSection title="Teams & People" nodes={TEAMS_NAV} {...sectionProps} />
        <NavSection title="Content" nodes={CONTENT_NAV} {...sectionProps} />
        <NavSection title="Administration" nodes={ADMIN_NAV} {...sectionProps} />
        <Box sx={{ mt: 1 }}>
          <NavSection title="" nodes={UTILITY_NAV} {...sectionProps} />
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

/** Workspace sidebar: permanent (collapsible) on desktop, drawer on mobile. */
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
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH } }}
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
          '& .MuiDrawer-paper': { width, position: 'relative', transition: 'width 0.2s ease', overflowX: 'hidden' },
        }}
        open
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={toggle} />
      </Drawer>
    </>
  );
}

export default AppSidebar;
