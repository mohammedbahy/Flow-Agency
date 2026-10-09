import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import AppLayout from '../../shared/layouts/AppLayout';
import DashboardLayout from '../../shared/layouts/DashboardLayout';
import HomePage from '../../shared/layouts/HomePage';
import NotFoundPage from '../../shared/layouts/NotFoundPage';
import { LoginPage } from '../../features/authentication';
import { DashboardPage } from '../../features/dashboard';
import { UsersPage } from '../../features/users';
import { ReviewsPage } from '../../features/reviews';

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
    path: '/reviews',
    element: (
      <DashboardLayout>
        <ReviewsPage />
      </DashboardLayout>
    ),
  },
];

export const router = createBrowserRouter(appRoutes);

export default router;
