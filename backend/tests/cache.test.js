const { cache, TTL } = require('../src/cache');

describe('MemoryCache', () => {
  it('stores and retrieves values', () => {
    cache.clear();
    cache.set('key1', { data: 'test' }, 5000);
    expect(cache.get('key1')).toEqual({ data: 'test' });
  });

  it('returns null for missing keys', () => {
    cache.clear();
    expect(cache.get('missing')).toBeNull();
  });

  it('tracks hit and miss stats', () => {
    cache.clear();
    cache.set('a', 1, 5000);
    cache.get('a');
    cache.get('b');
    const stats = cache.stats();
    expect(stats.hits).toBeGreaterThanOrEqual(1);
    expect(stats.misses).toBeGreaterThanOrEqual(1);
  });

  it('invalidates by prefix', () => {
    cache.clear();
    cache.set('services:all:', [1], 5000);
    cache.set('services:cat:home', [2], 5000);
    cache.invalidate('services:');
    expect(cache.get('services:all:')).toBeNull();
    expect(cache.get('services:cat:home')).toBeNull();
  });

  it('TTL constants are defined', () => {
    expect(TTL.categories).toBeGreaterThan(0);
    expect(TTL.services).toBeGreaterThan(0);
  });
});
