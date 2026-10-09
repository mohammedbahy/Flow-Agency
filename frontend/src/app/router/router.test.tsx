import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { appRoutes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

/** Route-level regression test against the real route configuration. */
describe('router', () => {
  it('renders login at /login', async () => {
    renderAt('/login');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('renders the dashboard at /dashboard', async () => {
    renderAt('/dashboard');
    expect(await screen.findByRole('heading', { name: /good morning, elena/i })).toBeInTheDocument();
  });

  it('renders users at /users', async () => {
    renderAt('/users');
    expect(await screen.findByRole('heading', { name: /users & access control/i })).toBeInTheDocument();
  });

  it('renders reviews at /reviews', async () => {
    renderAt('/reviews');
    expect(await screen.findByText(/items requiring review & approval/i)).toBeInTheDocument();
  });
});
