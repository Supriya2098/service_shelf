class MemoryCache {
  constructor() {
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value;
  }

  set(key, value, ttlMs = 60000) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear() {
    this.store.clear();
  }

  stats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total ? ((this.hits / total) * 100).toFixed(1) + '%' : '0%',
      size: this.store.size,
    };
  }
}

const cache = new MemoryCache();

const TTL = {
  categories: 5 * 60 * 1000,
  services: 2 * 60 * 1000,
  serviceDetail: 3 * 60 * 1000,
};

module.exports = { cache, TTL };
