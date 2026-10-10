import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import type { StoredUser } from '../../../core/auth/token-storage';
import { usersService } from '../services/users.service';
import UsersPage from './UsersPage';

vi.mock('../services/users.service', () => ({
  usersService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    changeStatus: vi.fn(),
    changeRole: vi.fn(),
  },
}));

vi.mock('../../teams/services/teams.service', () => ({
  teamsService: {
    list: vi.fn(async () => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
  },
}));

vi.mock('../../authentication/services/auth.service', () => ({
  authService: {
    permissionsMatrix: vi.fn(async () => [
      { role: 'admin', permissions: ['users:create', 'users:read'] },
      { role: 'employee', permissions: [] },
    ]),
  },
}));

const ADMIN_USER: StoredUser = {
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@test.co',
  role: 'admin',
  mustChangePassword: false,
};

const ALL_PERMISSIONS = ['users:create', 'users:read', 'users:update', 'users:deactivate', 'users:change_role'];

const API_USERS = [
  {
    id: 'u1',
    name: 'Elena Rostova',
    email: 'elena@test.co',
    role: 'admin',
    status: 'active',
    mustChangePassword: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'u2',
    name: 'Omar Strategist',
    email: 'omar@test.co',
    role: 'employee',
    status: 'inactive',
    mustChangePassword: false,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
];

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/users']}>
      <AuthProvider initialUser={ADMIN_USER} initialPermissions={ALL_PERMISSIONS}>
        <UsersPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usersService.list).mockResolvedValue({
    data: API_USERS as never[],
    pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
  });
});

describe('UsersPage', () => {
  it('renders live users from the API', async () => {
    renderPage();
    expect(await screen.findByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('omar@test.co')).toBeInTheDocument();
  });

  it('filters users by search query', async () => {
    renderPage();
    await screen.findByText('Elena Rostova');
    fireEvent.change(screen.getByLabelText(/search users/i), { target: { value: 'omar' } });
    expect(screen.queryByText('Elena Rostova')).not.toBeInTheDocument();
    expect(screen.getByText('Omar Strategist')).toBeInTheDocument();
  });

  it('deactivates a user through the API and confirms', async () => {
    vi.mocked(usersService.changeStatus).mockResolvedValueOnce({} as never);
    renderPage();
    await screen.findByText('Elena Rostova');
    fireEvent.click(screen.getByRole('button', { name: /actions for elena rostova/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /deactivate/i }));
    expect(await screen.findByText(/deactivated successfully/i)).toBeInTheDocument();
    expect(usersService.changeStatus).toHaveBeenCalledWith('u1', 'inactive');
  });

  it('shows a retry action when loading fails', async () => {
    vi.mocked(usersService.list).mockRejectedValueOnce(new Error('Cannot reach the server.'));
    renderPage();
    expect(await screen.findByText('Cannot reach the server.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
