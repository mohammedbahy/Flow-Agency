import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReviewsPage from './ReviewsPage';

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/reviews']}>
      <ReviewsPage />
    </MemoryRouter>,
  );
}

describe('ReviewsPage', () => {
  it('shows the action banner with the pending count', () => {
    renderPage();
    expect(screen.getByText(/you have 4 deliverable items awaiting review/i)).toBeInTheDocument();
  });

  it('requires a feedback note before sending an item back', async () => {
    renderPage();
    const requestButtons = screen.getAllByRole('button', { name: /request revision/i });
    fireEvent.click(requestButtons[0]);
    const sendButtons = await screen.findAllByRole('button', { name: /send back for revision/i });
    fireEvent.click(sendButtons[0]);
    expect(await screen.findByText(/add a short note/i)).toBeInTheDocument();
  });

  it('approves a deliverable locally and lists it under recently approved', async () => {
    renderPage();
    const approveButtons = screen.getAllByRole('button', { name: /approve deliverable/i });
    fireEvent.click(approveButtons[0]);
    const confirmButtons = await screen.findAllByRole('button', { name: /^approve$/i });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    expect(await screen.findByText(/approved in local preview/i)).toBeInTheDocument();
    expect(await screen.findByText(/you have 3 deliverable items awaiting review/i)).toBeInTheDocument();
  });
});
