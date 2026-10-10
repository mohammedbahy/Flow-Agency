import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import type { StoredUser } from '../../../core/auth/token-storage';
import { reviewsService } from '../services/reviews.service';
import ReviewsPage from './ReviewsPage';

vi.mock('../services/reviews.service', () => ({
  reviewsService: {
    list: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
  },
}));

const MANAGER_USER: StoredUser = {
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@test.co',
  role: 'admin',
  mustChangePassword: false,
};

const ALL_PERMISSIONS = ['reviews:read', 'reviews:manage'];

const API_ITEMS = [
  {
    id: 'r1',
    title: 'Homepage hero copy',
    contentType: 'copy',
    client: 'Acme Corp',
    project: 'Website relaunch',
    submittedBy: 'Mia Member',
    status: 'pending',
    preview: 'Headline draft.',
    feedback: null,
    decidedBy: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
];

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/reviews']}>
      <AuthProvider initialUser={MANAGER_USER} initialPermissions={ALL_PERMISSIONS}>
        <ReviewsPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(reviewsService.list).mockResolvedValue({
    data: API_ITEMS as never[],
    pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
  });
});

describe('ReviewsPage', () => {
  it('renders the live review queue', async () => {
    renderPage();
    expect(await screen.findByText('Homepage hero copy')).toBeInTheDocument();
    expect(screen.getByText(/1 awaiting review/i)).toBeInTheDocument();
  });

  it('requires a feedback note before sending an item back', async () => {
    renderPage();
    await screen.findByText('Homepage hero copy');
    fireEvent.click(screen.getAllByRole('button', { name: /request revision/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /send back for revision/i }));
    expect(await screen.findByText(/add a short note/i)).toBeInTheDocument();
    expect(reviewsService.reject).not.toHaveBeenCalled();
  });

  it('approves a deliverable through the API', async () => {
    vi.mocked(reviewsService.approve).mockResolvedValueOnce({ ...API_ITEMS[0], status: 'approved' } as never);
    renderPage();
    await screen.findByText('Homepage hero copy');
    fireEvent.click(screen.getAllByRole('button', { name: /approve deliverable/i })[0]);
    const confirmButtons = await screen.findAllByRole('button', { name: /^approve$/i });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(await screen.findByText(/approved successfully/i)).toBeInTheDocument();
    expect(reviewsService.approve).toHaveBeenCalledWith('r1');
  });
});
