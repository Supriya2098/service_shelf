const express = require('express');
const { db } = require('../database');
const { cache, TTL } = require('../cache');

const router = express.Router();

let stmts;

function getStmts() {
  if (!stmts) {
    stmts = {
      categories: db.prepare('SELECT * FROM service_categories ORDER BY name'),
      serviceBySlug: db.prepare(`
        SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
        FROM services s JOIN service_categories c ON s.category_id = c.id
        WHERE s.slug = ? AND s.is_active = 1
      `),
      serviceIdBySlug: db.prepare('SELECT id FROM services WHERE slug = ? AND is_active = 1'),
      bookedSlots: db.prepare(`
        SELECT time_slot FROM bookings
        WHERE service_id = ? AND booking_date = ? AND status NOT IN ('cancelled')
      `),
      allServices: db.prepare(`
        SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
        FROM services s JOIN service_categories c ON s.category_id = c.id
        WHERE s.is_active = 1
        ORDER BY s.rating DESC, s.review_count DESC
      `),
      servicesByCategory: db.prepare(`
        SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
        FROM services s JOIN service_categories c ON s.category_id = c.id
        WHERE s.is_active = 1 AND c.slug = ?
        ORDER BY s.rating DESC, s.review_count DESC
      `),
      servicesSearch: db.prepare(`
        SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
        FROM services s JOIN service_categories c ON s.category_id = c.id
        WHERE s.is_active = 1
          AND (s.name LIKE ? OR s.description LIKE ? OR s.short_description LIKE ?)
        ORDER BY s.rating DESC, s.review_count DESC
      `),
    };
  }
  return stmts;
}

function parseService(s) {
  return { ...s, features: s.features ? JSON.parse(s.features) : [] };
}

router.get('/categories', (req, res) => {
  const cacheKey = 'categories:all';
  const cached = cache.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  const categories = getStmts().categories.all();
  cache.set(cacheKey, categories, TTL.categories);
  res.setHeader('X-Cache', 'MISS');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json(categories);
});

router.get('/', (req, res) => {
  const { category, search } = req.query;
  const cacheKey = `services:${category || 'all'}:${search || ''}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  const s = getStmts();
  let services;
  if (search) {
    const term = `%${search}%`;
    services = s.servicesSearch.all(term, term, term);
  } else if (category) {
    services = s.servicesByCategory.all(category);
  } else {
    services = s.allServices.all();
  }

  const result = services.map(parseService);
  cache.set(cacheKey, result, TTL.services);
  res.setHeader('X-Cache', 'MISS');
  res.setHeader('Cache-Control', 'public, max-age=120');
  res.json(result);
});

router.get('/:slug', (req, res) => {
  const cacheKey = `service:${req.params.slug}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  const service = getStmts().serviceBySlug.get(req.params.slug);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const result = parseService(service);
  cache.set(cacheKey, result, TTL.serviceDetail);
  res.setHeader('X-Cache', 'MISS');
  res.json(result);
});

router.get('/:slug/slots', (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Date is required (YYYY-MM-DD)' });
  }

  const service = getStmts().serviceIdBySlug.get(req.params.slug);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const allSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];
  const booked = getStmts().bookedSlots.all(service.id, date).map(b => b.time_slot);
  const available = allSlots.filter(slot => !booked.includes(slot));

  res.json({ date, available, booked });
});

router.clearStmtCache = () => { stmts = null; };

module.exports = router;
