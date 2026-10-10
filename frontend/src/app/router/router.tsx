import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import AppLayout from '../../shared/layouts/AppLayout';
import DashboardLayout from '../../shared/layouts/DashboardLayout';
import HomePage from '../../shared/layouts/HomePage';
import NotFoundPage from '../../shared/layouts/NotFoundPage';
import { LoginPage, AdminLoginPage } from '../../features/authentication';
import { DashboardPage } from '../../features/dashboard';
import { UsersPage, AddUserPage, RolesPage } from '../../features/users';
import { ReviewsPage } from '../../features/reviews';
import { ProfilePage } from '../../features/profile';
import { TeamsPage, TeamAssignmentsPage } from '../../features/teams';
import { BrandPerformancePage } from '../../features/analytics';
import { TasksPage, CompletionRatePage, DelayedTasksPage, CompletedTasksPage } from '../../features/tasks';
import { ClientsPage } from '../../features/clients';
import {
  SettingsPage,
  AgencySettingsPage,
  ProfileSettingsPage,
  DeadlineRulesPage,
} from '../../features/settings';

/**
 * Unified route table (UI preview — no auth guards so every screen
 * is directly reviewable via navigation and direct URL entry).
 *
 * Merged from both team tracks (Oct 2026): duplicate screens were unified
 * to a single route each (/clients, /teams, /tasks/delayed,
 * /tasks/completed, /brand-performance).
 *
 * Temporary demo flow (until backend auth lands):
 * the Login screen's Sign In button navigates straight to /dashboard.
 *
 * Exported as data so tests can drive the exact same configuration
 * through a memory router.
 */
export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/dashboard',
    element: (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/agency',
    element: (
      <DashboardLayout>
        <DashboardPage initialTab="agency" />
      </DashboardLayout>
    ),
  },
  {
    path: '/users',
    element: (
      <DashboardLayout>
        <UsersPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/users/new',
    element: (
      <DashboardLayout>
        <AddUserPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/roles',
    element: (
      <DashboardLayout>
        <RolesPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/teams',
    element: (
      <DashboardLayout>
        <TeamsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/team/assignments',
    element: (
      <DashboardLayout>
        <TeamAssignmentsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/clients',
    element: (
      <DashboardLayout>
        <ClientsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/tasks',
    element: (
      <DashboardLayout>
        <TasksPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/tasks/completion',
    element: (
      <DashboardLayout>
        <CompletionRatePage />
      </DashboardLayout>
    ),
  },
  {
    path: '/tasks/delayed',
    element: (
      <DashboardLayout>
        <DelayedTasksPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/tasks/completed',
    element: (
      <DashboardLayout>
        <CompletedTasksPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/reviews',
    element: (
      <DashboardLayout>
        <ReviewsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/brand-performance',
    element: (
      <DashboardLayout>
        <BrandPerformancePage />
      </DashboardLayout>
    ),
  },
  {
    path: '/profile',
    element: (
      <DashboardLayout>
        <ProfilePage />
      </DashboardLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <DashboardLayout>
        <SettingsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/settings/agency',
    element: (
      <DashboardLayout>
        <AgencySettingsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/settings/profile',
    element: (
      <DashboardLayout>
        <ProfileSettingsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/settings/deadline-rules',
    element: (
      <DashboardLayout>
        <DeadlineRulesPage />
      </DashboardLayout>
    ),
  },
];

export const router = createBrowserRouter(appRoutes);

export default router;
