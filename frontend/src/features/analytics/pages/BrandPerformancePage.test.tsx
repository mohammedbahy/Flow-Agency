import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { brandsService } from '../services/analytics.service';
import BrandPerformancePage from './BrandPerformancePage';

vi.mock('../services/analytics.service', () => ({
  brandsService: {
    list: vi.fn(),
    metrics: vi.fn(),
    workflow: vi.fn(),
  },
  dashboardService: { get: vi.fn() },
}));

vi.mock('../../tasks/services/tasks.service', () => ({
  tasksService: {
    list: vi.fn(),
    delayed: vi.fn(async () => ({
      items: [],
      pagination: { page: 1, limit: 1, total: 3, totalPages: 1 },
    })),
    completionRate: vi.fn(async () => ({ total: 10, completed: 7, notCompleted: 3, rate: 0.7 })),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(brandsService.list).mockResolvedValue({
    data: [
      {
        id: 'b1',
        name: 'Apex Finish',
        description: null,
        client: { id: 'c1', name: 'Acme Corp' },
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
    ],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
  vi.mocked(brandsService.metrics).mockResolvedValue({
    brand: { id: 'b1', name: 'Apex Finish' },
    completionRate: 0.9,
    averageCompletionTimeMs: null,
  });
  vi.mocked(brandsService.workflow).mockResolvedValue({
    brand: {
      id: 'b1',
      name: 'Apex Finish',
      description: null,
      client: { id: 'c1', name: 'Acme Corp' },
      status: 'active',
      createdAt: '',
      updatedAt: '',
    },
    teams: [],
    workflow: { totalTasks: 5, byStatus: { completed: 4, pending: 1 } },
  });
});

describe('BrandPerformancePage', () => {
  it('renders the live brand breakdown', async () => {
    render(
      <MemoryRouter initialEntries={['/brand-performance']}>
        <BrandPerformancePage />
      </MemoryRouter>,
    );
    expect(await screen.findByText('Apex Finish')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getAllByText(/90%/).length).toBeGreaterThanOrEqual(1);
  });
});
