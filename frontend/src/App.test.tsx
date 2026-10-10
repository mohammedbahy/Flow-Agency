import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './shared/layouts/HomePage';

describe('HomePage (foundation smoke test)', () => {
  it('renders the application title', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Neurteq Agency Management')).toBeInTheDocument();
  });

  it('links to all four Sprint 1 screens', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    for (const path of ['/login', '/dashboard', '/users', '/reviews']) {
      expect(screen.getByRole('link', { name: (_content, el) => el.getAttribute('href') === path })).toHaveAttribute(
        'href',
        path,
      );
    }
  });
});
