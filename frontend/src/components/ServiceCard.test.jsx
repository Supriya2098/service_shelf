import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ServiceCard from './ServiceCard';

const mockService = {
  id: 1,
  slug: 'ac-service-repair',
  name: 'AC Service & Repair',
  short_description: 'Split AC servicing',
  price: 599,
  rating: 4.9,
  review_count: 100,
  category_name: 'Appliance Repair',
};

function renderCard(service = mockService) {
  return render(
    <BrowserRouter>
      <ServiceCard service={service} />
    </BrowserRouter>
  );
}

describe('ServiceCard', () => {
  it('renders service name and price', () => {
    renderCard();
    expect(screen.getByText('AC Service & Repair')).toBeInTheDocument();
    expect(screen.getByText('₹599')).toBeInTheDocument();
  });

  it('renders category badge', () => {
    renderCard();
    expect(screen.getByText('Appliance Repair')).toBeInTheDocument();
  });

  it('links to service detail page', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/services/ac-service-repair');
  });

  it('renders service image with lazy loading', () => {
    renderCard();
    const img = screen.getByRole('img', { name: 'AC Service & Repair' });
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img.getAttribute('src')).toContain('ac-service-repair');
  });
});
