/**
 * API performance benchmark — measures response times with and without cache.
 * Run: npm run benchmark (from backend/)
 */
require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE = `http://localhost:${PORT}`;
const ITERATIONS = 50;

function request(path) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime.bigint();
    http.get(`${BASE}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        resolve({ ms, cache: res.headers['x-cache'], status: res.statusCode });
      });
    }).on('error', reject);
  });
}

async function benchmark(label, path, iterations) {
  const times = [];
  let cacheHits = 0;
  for (let i = 0; i < iterations; i++) {
    const r = await request(path);
    times.push(r.ms);
    if (r.cache === 'HIT') cacheHits++;
  }
  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p95 = times[Math.floor(times.length * 0.95)];
  return { label, avg: avg.toFixed(2), p95: p95.toFixed(2), min: times[0].toFixed(2), cacheHits };
}

async function main() {
  console.log('\n=== SERVICE SHELF API Benchmark ===\n');
  console.log(`Server: ${BASE} | Iterations: ${ITERATIONS}\n`);

  try {
    await request('/api/health');
  } catch {
    console.error('ERROR: Start the server first with npm run dev');
    process.exit(1);
  }

  const results = [
    await benchmark('GET /api/services (cold + warm cache)', '/api/services', ITERATIONS),
    await benchmark('GET /api/services/categories', '/api/services/categories', ITERATIONS),
    await benchmark('GET /api/services/ac-service-repair', '/api/services/ac-service-repair', ITERATIONS),
    await benchmark('GET /api/health', '/api/health', ITERATIONS),
  ];

  console.log('Endpoint                          | Avg (ms) | P95 (ms) | Min (ms) | Cache Hits');
  console.log('----------------------------------|----------|----------|----------|----------');
  for (const r of results) {
    console.log(
      `${r.label.padEnd(34)}| ${r.avg.padStart(8)} | ${r.p95.padStart(8)} | ${r.min.padStart(8)} | ${r.cacheHits}/${ITERATIONS}`
    );
  }

  console.log('\nNote: First request per endpoint is MISS; subsequent are HIT with in-memory cache.\n');
}

main().catch(console.error);
