import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../../core/auth/AuthContext';
import { authService } from '../services/auth.service';
import LoginForm from './LoginForm';
import { validateLoginForm } from '../types/auth.types';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    changePassword: vi.fn(),
    myPermissions: vi.fn(async () => ({ role: 'admin', permissions: [] })),
  },
}));

const mockedLogin = vi.mocked(authService.login);

function renderForm() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider initialUser={null}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<div>Dashboard entered</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedLogin.mockResolvedValue({
    token: 'test-token',
    user: { id: 'u1', name: 'Test Admin', email: 'a@a.co', role: 'admin', mustChangePassword: false },
  });
});

describe('validateLoginForm', () => {
  it('requires email and password', () => {
    expect(validateLoginForm({ email: '', password: '', rememberMe: false })).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    });
  });

  it('rejects malformed emails and short passwords', () => {
    expect(validateLoginForm({ email: 'not-an-email', password: 'short', rememberMe: false })).toEqual({
      email: 'Enter a valid email address.',
      password: 'Password must be at least 8 characters.',
    });
  });

  it('accepts valid input', () => {
    expect(validateLoginForm({ email: 'you@agency.com', password: 'long-enough', rememberMe: true })).toEqual({});
  });
});

describe('LoginForm', () => {
  it('shows required-field errors on empty submit', async () => {
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: /sign in to workspace/i }));
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(await screen.findByText('Password is required.')).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('toggles password visibility', () => {
    renderForm();
    expect(screen.getByLabelText(/workspace password/i)).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByLabelText(/workspace password/i)).toHaveAttribute('type', 'text');
  });

  it('signs in through the auth service and enters the dashboard', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText(/agency email/i), { target: { value: 'admin@agency.com' } });
    fireEvent.change(screen.getByLabelText(/workspace password/i), { target: { value: 'Admin12345' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to workspace/i }));
    await waitFor(() => expect(mockedLogin).toHaveBeenCalledWith('admin@agency.com', 'Admin12345'));
    expect(await screen.findByText('Dashboard entered')).toBeInTheDocument();
  });

  it('shows backend errors without navigating', async () => {
    mockedLogin.mockRejectedValueOnce(new Error('Invalid email or password')); renderForm();
    fireEvent.change(screen.getByLabelText(/agency email/i), { target: { value: 'a@a.co' } });
    fireEvent.change(screen.getByLabelText(/workspace password/i), { target: { value: 'wrong-password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in to workspace/i }));
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard entered')).not.toBeInTheDocument();
  });
});
