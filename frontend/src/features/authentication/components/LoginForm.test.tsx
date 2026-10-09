import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginForm from './LoginForm';
import { validateLoginForm } from '../types/auth.types';

function renderForm() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<div>Dashboard entered</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('validateLoginForm', () => {
  it('requires email and password', () => {
    expect(validateLoginForm({ email: '', password: '', rememberMe: false })).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    });
  });

  it('rejects malformed emails and short passwords', () => {
    expect(
      validateLoginForm({ email: 'not-an-email', password: 'short', rememberMe: false }),
    ).toEqual({
      email: 'Enter a valid email address.',
      password: 'Password must be at least 8 characters.',
    });
  });

  it('accepts valid input', () => {
    expect(
      validateLoginForm({ email: 'you@agency.com', password: 'long-enough', rememberMe: true }),
    ).toEqual({});
  });
});

describe('LoginForm', () => {
  it('shows required-field errors on empty submit', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/agency email/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/workspace password/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to workspace/i }));
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(await screen.findByText('Password is required.')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    renderForm();
    expect(screen.getByLabelText(/workspace password/i)).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByLabelText(/workspace password/i)).toHaveAttribute('type', 'text');
  });

  it('navigates to the dashboard on valid submit (temporary demo flow)', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /sign in to workspace/i }));
    await waitFor(() => expect(screen.getByText('Dashboard entered')).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it('explains that SSO is disabled in the preview', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /google sso/i }));
    expect(await screen.findByText(/sso is disabled in this ui preview/i)).toBeInTheDocument();
  });
});
