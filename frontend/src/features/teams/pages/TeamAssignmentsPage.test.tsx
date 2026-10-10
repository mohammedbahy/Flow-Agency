import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeamAssignmentsPage from './TeamAssignmentsPage';

describe('TeamAssignmentsPage', () => {
  it('validates that a project and member are selected', async () => {
    render(
      <MemoryRouter initialEntries={['/team/assignments']}>
        <TeamAssignmentsPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /assign member/i }));
    expect(await screen.findByText(/select a project/i)).toBeInTheDocument();
  });

  it('assigns a member locally and shows a preview notice', async () => {
    render(
      <MemoryRouter initialEntries={['/team/assignments']}>
        <TeamAssignmentsPage />
      </MemoryRouter>,
    );
    fireEvent.mouseDown(screen.getByLabelText(/project/i));
    fireEvent.click(await screen.findByRole('option', { name: /website relaunch/i }));
    fireEvent.mouseDown(screen.getByLabelText(/team member/i));
    fireEvent.click(await screen.findByRole('option', { name: /maya lin/i }));
    fireEvent.click(screen.getByRole('button', { name: /assign member/i }));
    expect(await screen.findByText(/maya lin assigned to website relaunch/i)).toBeInTheDocument();
  });
});
