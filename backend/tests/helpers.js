const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('../src/database');
const { cache } = require('../src/cache');

function resetTestDb() {
  cache.clear();
  require('../src/routes/services').clearStmtCache();
  initDatabase();

  db.exec(`
    DELETE FROM notifications;
    DELETE FROM payments;
    DELETE FROM bookings;
    DELETE FROM services;
    DELETE FROM service_categories;
    DELETE FROM users;
  `);

  db.prepare('INSERT INTO service_categories (name, slug, icon) VALUES (?, ?, ?)').run('Home Services', 'home-services', '🏠');
  const catId = db.prepare('SELECT id FROM service_categories WHERE slug = ?').get('home-services').id;

  db.prepare(`
    INSERT INTO services (category_id, name, slug, description, short_description, price, features)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(catId, 'AC Service', 'ac-service-repair', 'AC repair desc', 'AC repair', 599, '["Filter cleaning"]');

  const hash = bcrypt.hashSync('test123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Test User', 'test@test.com', hash, 'customer');
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin', 'admin@test.com', hash, 'admin');
}

function getAuthToken(app, email = 'test@test.com') {
  const request = require('supertest');
  return request(app)
    .post('/api/auth/login')
    .send({ email, password: 'test123' })
    .then(res => res.body.token);
}

module.exports = { resetTestDb, getAuthToken };
