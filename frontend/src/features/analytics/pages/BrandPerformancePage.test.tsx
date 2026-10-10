import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BrandPerformancePage from './BrandPerformancePage';

describe('BrandPerformancePage', () => {
  it('renders brand metrics and workflow stages', () => {
    render(
      <MemoryRouter initialEntries={['/analytics/brand-performance']}>
        <BrandPerformancePage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Apex Finish').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();
  });

  it('switches the date range', () => {
    render(
      <MemoryRouter initialEntries={['/analytics/brand-performance']}>
        <BrandPerformancePage />
      </MemoryRouter>,
    );
    fireEvent.mouseDown(screen.getByLabelText(/date range/i));
    fireEvent.click(screen.getByRole('option', { name: /last 30 days/i }));
    expect(screen.getByRole('combobox', { name: /date range/i })).toHaveTextContent('Last 30 days');
  });
});
