const express = require('express');
const { db } = require('../database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { notifyStatusUpdate } = require('../services/notifications');

const router = express.Router();
router.use(authenticate, requireAdmin);

router.get('/stats', (req, res) => {
  const stats = {
    totalBookings: db.prepare('SELECT COUNT(*) as c FROM bookings').get().c,
    pendingBookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'").get().c,
    confirmedBookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'confirmed'").get().c,
    completedBookings: db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'completed'").get().c,
    totalRevenue: db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'").get().total,
    totalCustomers: db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'customer'").get().c,
    totalServices: db.prepare('SELECT COUNT(*) as c FROM services WHERE is_active = 1').get().c,
  };
  res.json(stats);
});

router.get('/bookings', (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT b.*, s.name as service_name, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
           p.status as payment_status, p.payment_ref
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN users u ON b.user_id = u.id
    LEFT JOIN payments p ON p.booking_id = b.id
  `;
  const params = [];
  if (status) { sql += ' WHERE b.status = ?'; params.push(status); }
  sql += ' ORDER BY b.created_at DESC';

  res.json(db.prepare(sql).all(...params));
});

router.patch('/bookings/:ref/status', (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(req.params.ref);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  db.prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, booking.id);

  const user = db.prepare('SELECT id, name, email, phone FROM users WHERE id = ?').get(booking.user_id);
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(booking.service_id);
  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id);

  notifyStatusUpdate(user, updated, service, status);
  res.json(updated);
});

router.get('/services', (req, res) => {
  const services = db.prepare(`
    SELECT s.*, c.name as category_name FROM services s
    JOIN service_categories c ON s.category_id = c.id ORDER BY s.name
  `).all().map(s => ({ ...s, features: s.features ? JSON.parse(s.features) : [] }));
  res.json(services);
});

router.patch('/services/:id/toggle', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  db.prepare('UPDATE services SET is_active = ? WHERE id = ?').run(service.is_active ? 0 : 1, service.id);
  res.json(db.prepare('SELECT * FROM services WHERE id = ?').get(service.id));
});

module.exports = router;
