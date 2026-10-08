import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './shared/layouts/HomePage';

describe('HomePage (foundation smoke test)', () => {
  it('renders the application title', () => {
    render(<HomePage />);
    expect(screen.getByText('Agency Management System')).toBeInTheDocument();
  });
});
