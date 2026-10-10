import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import type { StoredUser } from '../../../core/auth/token-storage';
import { tasksService } from '../../tasks/services/tasks.service';
import DashboardPage from './DashboardPage';

vi.mock('../../analytics/services/analytics.service', () => ({
  dashboardService: {
    get: vi.fn(async () => ({
      clients: { total: 2, active: 2, inactive: 0 },
      tasks: {
        total: 5,
        byStatus: { pending: 2, in_progress: 1, completed: 2, cancelled: 0 },
        completionRate: 0.4,
        averageCompletionTimeMs: null,
      },
      teams: { total: 1, active: 1, byTeam: [] },
      brands: { total: 1, active: 1, inactive: 0 },
    })),
  },
  brandsService: {
    list: vi.fn(),
    metrics: vi.fn(),
    workflow: vi.fn(),
  },
}));

vi.mock('../../tasks/services/tasks.service', () => ({
  tasksService: {
    list: vi.fn(async () => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
    delayed: vi.fn(async () => ({
      items: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
    })),
    completionRate: vi.fn(async () => ({ total: 0, completed: 0, notCompleted: 0, rate: 0 })),
  },
}));

vi.mock('../../teams/services/teams.service', () => ({
  teamsService: {
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

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider initialUser={ADMIN_USER} initialPermissions={[]}>
        <DashboardPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  it('renders live KPI cards from the dashboard aggregate', async () => {
    renderPage();
    expect(await screen.findByText('ACTIVE CLIENTS')).toBeInTheDocument();
    expect(screen.getByText('TASK COMPLETION')).toBeInTheDocument();
  });

  it('shows and dismisses the escalation banner when work is overdue', async () => {
    vi.mocked(tasksService.delayed).mockResolvedValueOnce({
      items: [
        {
          id: 't1',
          title: 'Late deliverable',
          taskType: 'design',
          status: 'pending',
          publishingDate: null,
          deadline: '2026-01-01T00:00:00.000Z',
          daysOverdue: 9,
          assignee: null,
          client: { id: 'c1', name: 'Acme' },
          team: null,
        },
      ],
      pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
    renderPage();
    expect(await screen.findByText(/overdue deliverables require intervention/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /resolve escalation/i }));
    expect(screen.queryByText(/overdue deliverables require intervention/i)).not.toBeInTheDocument();
  });

  it('links to the full approval queue', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /view full approval queue/i })).toHaveAttribute('href', '/reviews');
  });
});
