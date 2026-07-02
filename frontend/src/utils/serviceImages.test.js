import { describe, it, expect } from 'vitest';
import { getServiceImage } from '../utils/serviceImages';

describe('getServiceImage', () => {
  it('returns correct image for known slug', () => {
    expect(getServiceImage('ac-service-repair')).toBe('/images/services/ac-service-repair.jpg');
  });

  it('returns fallback for unknown slug', () => {
    expect(getServiceImage('unknown-service')).toBe('/images/services/deep-home-cleaning.jpg');
  });

  it('returns image path for all seeded services', () => {
    const slugs = [
      'deep-home-cleaning', 'massage-therapy', 'cctv-installation',
      'plumbing-services', 'termite-treatment',
    ];
    slugs.forEach(slug => {
      expect(getServiceImage(slug)).toMatch(/^\/images\/services\/.+\.jpg$/);
    });
  });
});
