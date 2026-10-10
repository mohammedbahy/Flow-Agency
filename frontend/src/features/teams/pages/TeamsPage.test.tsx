import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import type { StoredUser } from '../../../core/auth/token-storage';
import { teamsService } from '../services/teams.service';
import TeamsPage from './TeamsPage';

vi.mock('../services/teams.service', () => ({
  teamsService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    addMembers: vi.fn(),
    removeMember: vi.fn(),
    deleteTeam: vi.fn(),
  },
}));

vi.mock('../../users/services/users.service', () => ({
  usersService: {
    list: vi.fn(async () => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
  },
}));

vi.mock('../../tasks/services/tasks.service', () => ({
  tasksService: {
    list: vi.fn(async () => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
  },
}));

const ADMIN_USER: StoredUser = {
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@test.co',
  role: 'admin',
  mustChangePassword: false,
};

const ALL_PERMISSIONS = ['teams:create', 'teams:read', 'teams:delete', 'teams:manage_members'];

const API_TEAMS = [
  {
    id: 't1',
    name: 'Creative & Design',
    description: 'Brand systems',
    status: 'active',
    memberCount: 1,
    members: [{ id: 'u1', name: 'Maya Lin', email: 'maya@test.co', role: 'employee' }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

function seedTeams() {
  vi.mocked(teamsService.list).mockResolvedValue({
    data: API_TEAMS as never[],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
  vi.mocked(teamsService.get).mockResolvedValue(API_TEAMS[0] as never);
}

describe('TeamsPage', () => {
  it('renders live teams with members', async () => {
    seedTeams();
    render(
      <MemoryRouter initialEntries={['/teams']}>
        <AuthProvider initialUser={ADMIN_USER} initialPermissions={ALL_PERMISSIONS}>
          <TeamsPage />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByText('Creative & Design')).toBeInTheDocument();
    expect(screen.getByText(/1 member/i)).toBeInTheDocument();
  });
});

