import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DelayedTasksPage, CompletedTasksPage } from './TaskPages';

describe('DelayedTasksPage', () => {
  it('renders overdue tasks with assignees', () => {
    render(
      <MemoryRouter initialEntries={['/tasks/delayed']}>
        <DelayedTasksPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('TikTok cutdowns — batch 2')).toBeInTheDocument();
    expect(screen.getAllByText('Delayed').length).toBeGreaterThan(0);
  });

  it('filters tasks by search query', () => {
    render(
      <MemoryRouter initialEntries={['/tasks/delayed']}>
        <DelayedTasksPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/search tasks/i), { target: { value: 'lookbook' } });
    expect(screen.queryByText('TikTok cutdowns — batch 2')).not.toBeInTheDocument();
    expect(screen.getByText('Lookbook print proofs')).toBeInTheDocument();
  });
});

describe('CompletedTasksPage', () => {
  it('renders completed tasks with completion dates', () => {
    render(
      <MemoryRouter initialEntries={['/tasks/completed']}>
        <CompletedTasksPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Brand voice one-pager')).toBeInTheDocument();
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });
});
