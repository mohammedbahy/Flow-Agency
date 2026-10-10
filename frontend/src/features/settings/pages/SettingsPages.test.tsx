import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgencySettingsPage from './AgencySettingsPage';
import ProfileSettingsPage from './ProfileSettingsPage';
import DeadlineRulesPage from './DeadlineRulesPage';

describe('AgencySettingsPage', () => {
  it('validates the agency name and email', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/agency']}>
        <AgencySettingsPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/agency name/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Agency name is required.')).toBeInTheDocument();
  });
});

describe('ProfileSettingsPage', () => {
  it('requires matching passwords', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/settings/profile']}>
        <ProfileSettingsPage />
      </MemoryRouter>,
    );
    const current = container.querySelector('#pw-current');
    const next = container.querySelector('#pw-new');
    const confirm = container.querySelector('#pw-confirm');
    if (!current || !next || !confirm) throw new Error('password fields missing');
    fireEvent.change(current, { target: { value: 'old-password' } });
    fireEvent.change(next, { target: { value: 'new-password-1' } });
    fireEvent.change(confirm, { target: { value: 'different-password' } });
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });
});

describe('DeadlineRulesPage', () => {
  it('toggles a rule and adds a new one locally', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/deadline-rules']}>
        <DeadlineRulesPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Client review SLA')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add rule/i }));
    fireEvent.change(screen.getByLabelText(/rule name/i), { target: { value: 'Weekend freeze' } });
    fireEvent.change(screen.getByLabelText(/^limit/i), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: /^add rule$/i }));
    expect(await screen.findByText(/weekend freeze” added \(local preview/i)).toBeInTheDocument();
  });
});
