import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UsersPage from './UsersPage';

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/users']}>
      <UsersPage />
    </MemoryRouter>,
  );
}

describe('UsersPage', () => {
  it('renders the team directory', () => {
    renderPage();
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('elena.rostova@nexusagency.co')).toBeInTheDocument();
  });

  it('filters users by search query', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/search users/i), {
      target: { value: 'julian' },
    });
    expect(screen.queryByText('Elena Rostova')).not.toBeInTheDocument();
    expect(screen.getByText('Julian Vane')).toBeInTheDocument();
  });

  it('suspends a user locally and shows a preview notice', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /actions for elena rostova/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /suspend/i }));
    expect(screen.getByText(/local preview — not saved/i)).toBeInTheDocument();
  });

  it('opens the roles tab from the directory tabs', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('tab', { name: /roles & permissions/i }));
    expect(await screen.findByText('Super Admin')).toBeInTheDocument();
  });
});
