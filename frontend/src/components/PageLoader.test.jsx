import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageLoader from './PageLoader';

describe('PageLoader', () => {
  it('renders loading text', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('has accessible loading status', () => {
    render(<PageLoader />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading page');
  });
});
