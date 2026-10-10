import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import type { StoredUser } from '../../../core/auth/token-storage';
import { tasksService } from '../services/tasks.service';
import { DelayedTasksPage, CompletedTasksPage } from './TaskPages';

vi.mock('../services/tasks.service', () => ({
  tasksService: {
    list: vi.fn(),
    delayed: vi.fn(),
    completionRate: vi.fn(),
  },
}));

vi.mock('../../users/services/users.service', () => ({
  usersService: {
    list: vi.fn(async () => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
  },
}));

vi.mock('../../clients/services/clients.service', () => ({
  clientsService: {
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

function renderPage(path: string, page: React.ReactNode) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider initialUser={ADMIN_USER} initialPermissions={[]}>
        {page}
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(tasksService.delayed).mockResolvedValue({
    items: [
      {
        id: 't1',
        title: 'TikTok cutdowns',
        taskType: 'video',
        status: 'pending',
        publishingDate: null,
        deadline: '2026-10-06T00:00:00.000Z',
        daysOverdue: 4,
        assignee: { id: 'u1', name: 'Liam Designer', email: 'liam@test.co' },
        client: { id: 'c1', name: 'Apex Finish' },
        team: null,
      },
    ],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
  vi.mocked(tasksService.list).mockResolvedValue({
    data: [
      {
        id: 't2',
        title: 'Brand voice one-pager',
        taskType: 'content',
        status: 'completed',
        publishingDate: null,
        deadline: '2026-10-06T00:00:00.000Z',
        deadlineOverridden: false,
        assignee: null,
        client: null,
        team: null,
        createdBy: 'admin-1',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-06T00:00:00.000Z',
      },
    ],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
});

describe('DelayedTasksPage', () => {
  it('renders the live overdue report', async () => {
    renderPage('/tasks/delayed', <DelayedTasksPage />);
    expect(await screen.findByText('TikTok cutdowns')).toBeInTheDocument();
    expect(screen.getByText(/4 days overdue/i)).toBeInTheDocument();
  });
});

describe('CompletedTasksPage', () => {
  it('renders live completed tasks', async () => {
    renderPage('/tasks/completed', <CompletedTasksPage />);
    expect(await screen.findByText('Brand voice one-pager')).toBeInTheDocument();
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });
});
