import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  it('renders KPI cards and the pending reviews table', () => {
    renderPage();
    expect(screen.getByText('TASK VELOCITY')).toBeInTheDocument();
    expect(screen.getByText('Apex Finish')).toBeInTheDocument();
  });

  it('dismisses the escalation banner', () => {
    renderPage();
    expect(screen.getByText(/overdue deliverables require intervention/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /resolve escalation/i }));
    expect(screen.queryByText(/overdue deliverables require intervention/i)).not.toBeInTheDocument();
  });

  it('links to the full approval queue', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /view full approval queue/i })).toHaveAttribute(
      'href',
      '/reviews',
    );
  });
});
