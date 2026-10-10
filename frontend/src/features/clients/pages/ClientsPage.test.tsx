import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClientsPage from './ClientsPage';

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/clients']}>
      <ClientsPage />
    </MemoryRouter>,
  );
}

describe('ClientsPage', () => {
  it('renders the client directory', () => {
    renderPage();
    expect(screen.getAllByText('Apex Finish').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('svetlana.b@apexfinish.com')).toBeInTheDocument();
  });

  it('filters clients by search query', () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/search clients/i), { target: { value: 'hooli' } });
    expect(screen.queryByText('Apex Finish')).not.toBeInTheDocument();
    expect(screen.getAllByText('Hooli').length).toBeGreaterThanOrEqual(1);
  });

  it('creates a client locally through the dialog', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /add client/i }));
    fireEvent.change(screen.getByLabelText(/client name/i), { target: { value: 'NewCo' } });
    fireEvent.change(screen.getByLabelText(/contact email/i), { target: { value: 'hello@newco.com' } });
    fireEvent.click(screen.getByRole('button', { name: /^add client$/i }));
    expect(await screen.findByText(/newco added \(local preview/i)).toBeInTheDocument();
  });
});
