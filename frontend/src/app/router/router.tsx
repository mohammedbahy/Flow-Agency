import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import AppLayout from '../../shared/layouts/AppLayout';
import DashboardLayout from '../../shared/layouts/DashboardLayout';
import HomePage from '../../shared/layouts/HomePage';
import NotFoundPage from '../../shared/layouts/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
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

/** App screens require a live session (JWT); /login stays public. */
function protect(element: ReactNode) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{element}</DashboardLayout>
    </ProtectedRoute>
  );
}

/**
 * Route table (backend-integrated):
 * - AuthShell provides the session to every route.
 * - ProtectedRoute bounces signed-out visitors to /login.
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
  { path: '/dashboard', element: protect(<DashboardPage />) },
  { path: '/agency', element: protect(<DashboardPage initialTab="agency" />) },
  { path: '/users', element: protect(<UsersPage />) },
  { path: '/users/new', element: protect(<AddUserPage />) },
  { path: '/roles', element: protect(<RolesPage />) },
  { path: '/teams', element: protect(<TeamsPage />) },
  { path: '/team/assignments', element: protect(<TeamAssignmentsPage />) },
  { path: '/clients', element: protect(<ClientsPage />) },
  { path: '/tasks', element: protect(<TasksPage />) },
  { path: '/tasks/completion', element: protect(<CompletionRatePage />) },
  { path: '/tasks/delayed', element: protect(<DelayedTasksPage />) },
  { path: '/tasks/completed', element: protect(<CompletedTasksPage />) },
  { path: '/reviews', element: protect(<ReviewsPage />) },
  { path: '/brand-performance', element: protect(<BrandPerformancePage />) },
  { path: '/profile', element: protect(<ProfilePage />) },
  { path: '/settings', element: protect(<SettingsPage />) },
  { path: '/settings/agency', element: protect(<AgencySettingsPage />) },
  { path: '/settings/profile', element: protect(<ProfileSettingsPage />) },
  { path: '/settings/deadline-rules', element: protect(<DeadlineRulesPage />) },
];

export const router = createBrowserRouter(appRoutes);

export default router;
