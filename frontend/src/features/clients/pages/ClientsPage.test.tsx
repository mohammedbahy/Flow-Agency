import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import type { StoredUser } from '../../../core/auth/token-storage';
import { clientsService } from '../services/clients.service';
import ClientsPage from './ClientsPage';

vi.mock('../services/clients.service', () => ({
  clientsService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

const ADMIN_USER: StoredUser = {
  id: 'admin-1',
  name: 'Test Admin',
  email: 'admin@test.co',
  role: 'admin',
  mustChangePassword: false,
};

const API_CLIENTS = [
  {
    id: 'c1',
    name: 'Apex Finish',
    description: 'Automotive',
    email: 'hello@apexfinish.com',
    phone: '+1000000',
    status: 'active',
    notes: null,
    accountManager: null,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'c2',
    name: 'Hooli',
    description: 'Technology',
    email: 'hello@hooli.com',
    phone: null,
    status: 'inactive',
    notes: null,
    accountManager: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
  },
];

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/clients']}>
      <AuthProvider initialUser={ADMIN_USER} initialPermissions={[]}>
        <ClientsPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(clientsService.list).mockResolvedValue({
    data: API_CLIENTS as never[],
    pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
  });
});

describe('ClientsPage', () => {
  it('renders live clients from the API', async () => {
    renderPage();
    expect(await screen.findByText('Apex Finish')).toBeInTheDocument();
    expect(screen.getByText('hello@hooli.com')).toBeInTheDocument();
  });

  it('filters clients by search query', async () => {
    renderPage();
    await screen.findByText('Apex Finish');
    fireEvent.change(screen.getByLabelText(/search clients/i), { target: { value: 'hooli' } });
    expect(screen.queryByText('Apex Finish')).not.toBeInTheDocument();
    expect(screen.getByText('Hooli')).toBeInTheDocument();
  });

  it('creates a client through the API', async () => {
    vi.mocked(clientsService.create).mockResolvedValueOnce({ name: 'NewCo' } as never);
    renderPage();
    await screen.findByText('Apex Finish');
    fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    fireEvent.change(screen.getByLabelText(/client name/i), { target: { value: 'NewCo' } });
    fireEvent.change(screen.getByLabelText(/contact email/i), { target: { value: 'hello@newco.com' } });
    fireEvent.click(screen.getByRole('button', { name: /^add client$/i }));
    expect(await screen.findByText(/newco added successfully/i)).toBeInTheDocument();
    expect(clientsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'NewCo', email: 'hello@newco.com' }),
    );
  });
});
