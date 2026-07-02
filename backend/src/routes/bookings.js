const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const { notifyBookingConfirmed } = require('../services/notifications');

const router = express.Router();

function generateRef(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

router.post('/', authenticate, (req, res) => {
  const { serviceId, bookingDate, timeSlot, address, city, phone, notes } = req.body;

  if (!serviceId || !bookingDate || !timeSlot || !address || !city || !phone) {
    return res.status(400).json({ error: 'All booking fields are required' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND is_active = 1').get(serviceId);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  const conflict = db.prepare(`
    SELECT id FROM bookings WHERE service_id = ? AND booking_date = ? AND time_slot = ? AND status NOT IN ('cancelled')
  `).get(serviceId, bookingDate, timeSlot);
  if (conflict) return res.status(409).json({ error: 'This time slot is no longer available' });

  const bookingRef = generateRef('SS');
  const result = db.prepare(`
    INSERT INTO bookings (booking_ref, user_id, service_id, booking_date, time_slot, address, city, phone, notes, total_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(bookingRef, req.user.id, serviceId, bookingDate, timeSlot, address, city, phone, notes || null, service.price);

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);

  db.prepare(`
    INSERT INTO payments (booking_id, payment_ref, amount, status) VALUES (?, ?, ?, 'pending')
  `).run(booking.id, generateRef('PAY'), service.price);

  res.status(201).json({ booking, service, paymentRequired: true });
});

router.get('/my', authenticate, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, s.name as service_name, s.slug as service_slug, s.image_url,
           p.status as payment_status, p.payment_ref, p.transaction_id
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    LEFT JOIN payments p ON p.booking_id = b.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(bookings);
});

router.get('/:ref', authenticate, (req, res) => {
  const booking = db.prepare(`
    SELECT b.*, s.name as service_name, s.slug as service_slug, s.image_url, s.description as service_description,
           p.id as payment_id, p.payment_ref, p.amount as payment_amount, p.status as payment_status, p.transaction_id, p.paid_at
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    LEFT JOIN payments p ON p.booking_id = b.id
    WHERE b.booking_ref = ? AND (b.user_id = ? OR ? = 'admin')
  `).get(req.params.ref, req.user.id, req.user.role);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

router.patch('/:ref/cancel', authenticate, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ? AND user_id = ?').get(req.params.ref, req.user.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (['completed', 'cancelled'].includes(booking.status)) {
    return res.status(400).json({ error: `Cannot cancel a ${booking.status} booking` });
  }

  db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(booking.id);
  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id);
  res.json(updated);
});

module.exports = router;
