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
import { TeamsPage } from '../../features/teams';
import { BrandPerformancePage } from '../../features/brand-performance';
import { TasksPage } from '../../features/tasks';
import { ClientsPage } from '../../features/clients';
import { SettingsPage } from '../../features/settings';

/**
 * Sprint 1 route table (UI preview — no auth guards so every screen
 * is directly reviewable via navigation and direct URL entry).
 *
 * Temporary demo flow (until backend auth lands in Sprint 1+):
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
    path: '/teams',
    element: (
      <DashboardLayout>
        <TeamsPage />
      </DashboardLayout>
    ),
  },
  {
    path: '/team-assignment',
    element: (
      <DashboardLayout>
        <TeamsPage initialTab="assignment" />
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
    path: '/profile',
    element: (
      <DashboardLayout>
        <ProfilePage />
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
    path: '/brand-performance',
    element: (
      <DashboardLayout>
        <BrandPerformancePage />
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
        <TasksPage initialTab="rate" />
      </DashboardLayout>
    ),
  },
  {
    path: '/tasks/delayed',
    element: (
      <DashboardLayout>
        <TasksPage initialTab="delayed" />
      </DashboardLayout>
    ),
  },
  {
    path: '/tasks/completed',
    element: (
      <DashboardLayout>
        <TasksPage initialTab="completed" />
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
    path: '/clients',
    element: (
      <DashboardLayout>
        <ClientsPage />
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
];

export const router = createBrowserRouter(appRoutes);

export default router;
