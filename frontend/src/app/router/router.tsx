import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../../shared/layouts/AppLayout';
import HomePage from '../../shared/layouts/HomePage';

/**
 * Minimal Sprint-0 route table. Feature routes (/login, /dashboard,
 * /users, …) arrive with their Sprint 1+ features — do not pre-create them.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);

export default router;
