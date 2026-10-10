import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import type { StoredUser } from '../../../core/auth/token-storage';
import { deadlineRulesService } from '../services/deadline-rules.service';
import AgencySettingsPage from './AgencySettingsPage';
import ProfileSettingsPage from './ProfileSettingsPage';
import DeadlineRulesPage from './DeadlineRulesPage';
import { authService } from '../../authentication/services/auth.service';

vi.mock('../services/deadline-rules.service', () => ({
  deadlineRulesService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('../../authentication/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    changePassword: vi.fn(),
    myPermissions: vi.fn(),
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
      <AuthProvider initialUser={ADMIN_USER} initialPermissions={['deadline_rules:manage']}>
        {page}
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(deadlineRulesService.list).mockResolvedValue([
    {
      id: 'dr1',
      taskType: 'design',
      offsetValue: 48,
      offsetUnit: 'hours',
      direction: 'before',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]);
});

vi.mock('../services/agency-settings.service', () => ({
  agencySettingsService: {
    get: vi.fn(async () => ({ id: 'ag1', name: 'Nexus Agency', email: 'ops@test.co', phone: '', address: '' })),
    update: vi.fn(async (body: unknown) => ({ id: 'ag1', ...(body as object) })),
  },
}));

describe('AgencySettingsPage', () => {
  it('loads live settings and validates the agency name', async () => {
    renderPage('/settings/agency', <AgencySettingsPage />);
    await screen.findByDisplayValue('Nexus Agency');
    fireEvent.change(screen.getByLabelText(/agency name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Agency name is required.')).toBeInTheDocument();
  });
});

describe('ProfileSettingsPage', () => {
  it('requires matching passwords', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/settings/profile']}>
        <AuthProvider initialUser={ADMIN_USER} initialPermissions={[]}>
          <ProfileSettingsPage />
        </AuthProvider>
      </MemoryRouter>,
    );
    const current = container.querySelector('#pw-current');
    const next = container.querySelector('#pw-new');
    const confirm = container.querySelector('#pw-confirm');
    if (!current || !next || !confirm) throw new Error('password fields missing');
    fireEvent.change(current, { target: { value: 'Old-password1!' } });
    fireEvent.change(next, { target: { value: 'New-password1!' } });
    fireEvent.change(confirm, { target: { value: 'Different1!' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('changes the password through the API', async () => {
    vi.mocked(authService.changePassword).mockResolvedValueOnce('Password changed successfully.');
    const { container } = render(
      <MemoryRouter initialEntries={['/settings/profile']}>
        <AuthProvider initialUser={ADMIN_USER} initialPermissions={[]}>
          <ProfileSettingsPage />
        </AuthProvider>
      </MemoryRouter>,
    );
    const current = container.querySelector('#pw-current');
    const next = container.querySelector('#pw-new');
    const confirm = container.querySelector('#pw-confirm');
    if (!current || !next || !confirm) throw new Error('password fields missing');
    fireEvent.change(current, { target: { value: 'Old-password1!' } });
    fireEvent.change(next, { target: { value: 'New-password1!' } });
    fireEvent.change(confirm, { target: { value: 'New-password1!' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText(/password changed successfully/i)).toBeInTheDocument();
    expect(authService.changePassword).toHaveBeenCalledWith('Old-password1!', 'New-password1!');
  });
});

describe('DeadlineRulesPage', () => {
  it('lists live rules and adds a new one through the API', async () => {
    vi.mocked(deadlineRulesService.create).mockResolvedValueOnce({
      id: 'dr9',
      taskType: 'video',
      offsetValue: 12,
      offsetUnit: 'hours',
      direction: 'before',
      active: true,
      createdAt: '',
      updatedAt: '',
    });
    renderPage('/settings/deadline-rules', <DeadlineRulesPage />);
    expect(await screen.findByText('Design')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add rule/i }));
    fireEvent.change(screen.getByLabelText(/^offset/i), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: /^add rule$/i }));
    expect(await screen.findByText(/added successfully/i)).toBeInTheDocument();
    expect(deadlineRulesService.create).toHaveBeenCalledWith(
      expect.objectContaining({ taskType: 'design', offsetValue: 12 }),
    );
  });
});
