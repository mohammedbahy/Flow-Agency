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

  it('renders profile at /profile', async () => {
    renderAt('/profile');
    expect(await screen.findByRole('heading', { name: /^profile$/i })).toBeInTheDocument();
  });

  it('renders add user at /users/new', async () => {
    renderAt('/users/new');
    expect(await screen.findByRole('heading', { name: /^add user$/i })).toBeInTheDocument();
  });

  it('renders teams at /teams', async () => {
    renderAt('/teams');
    expect(await screen.findByRole('heading', { name: /teams management/i })).toBeInTheDocument();
  });

  it('renders settings at /settings', async () => {
    renderAt('/settings');
    expect(await screen.findByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: /deadlines/i })).toBeInTheDocument();
  });

  it('renders admin login at /admin/login', async () => {
    renderAt('/admin/login');
    expect(await screen.findByText(/restricted workspace console/i)).toBeInTheDocument();
  });

  it('renders roles directory at /roles', async () => {
    renderAt('/roles');
    expect(await screen.findByRole('heading', { name: /roles & permissions/i })).toBeInTheDocument();
  });

  it('renders brand performance at /brand-performance', async () => {
    renderAt('/brand-performance');
    expect(await screen.findByRole('heading', { name: /brand performance/i })).toBeInTheDocument();
  });

  it('renders tasks workspace at /tasks', async () => {
    renderAt('/tasks');
    expect(await screen.findByRole('heading', { name: /^tasks$/i })).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: /completion rate/i })).toBeInTheDocument();
  });

  it('renders completion rate at /tasks/completion', async () => {
    renderAt('/tasks/completion');
    expect(await screen.findByRole('tab', { name: /completion rate/i })).toBeInTheDocument();
  });

  it('renders delayed tasks at /tasks/delayed', async () => {
    renderAt('/tasks/delayed');
    expect(await screen.findByText(/escalation rule active/i)).toBeInTheDocument();
  });

  it('renders completed tasks at /tasks/completed', async () => {
    renderAt('/tasks/completed');
    expect(await screen.findByRole('heading', { name: /^tasks$/i })).toBeInTheDocument();
  });

  it('renders agency overview inside dashboard at /agency', async () => {
    renderAt('/agency');
    expect(await screen.findByRole('heading', { name: /agency overview/i })).toBeInTheDocument();
  });

  it('renders team assignment inside teams at /team-assignment', async () => {
    renderAt('/team-assignment');
    expect(await screen.findByRole('tab', { name: /assignment/i })).toBeInTheDocument();
  });

  it('renders clients at /clients', async () => {
    renderAt('/clients');
    expect(await screen.findByRole('heading', { name: /client management/i })).toBeInTheDocument();
  });
});
