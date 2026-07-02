const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { authenticate } = require('../middleware/auth');
const { notifyPaymentSuccess, notifyBookingConfirmed } = require('../services/notifications');

const router = express.Router();

router.post('/demo-pay', authenticate, (req, res) => {
  const { bookingRef, method = 'upi' } = req.body;
  if (!bookingRef) return res.status(400).json({ error: 'Booking reference required' });

  const booking = db.prepare(`
    SELECT b.*, u.name, u.email, u.phone FROM bookings b
    JOIN users u ON b.user_id = u.id
    WHERE b.booking_ref = ? AND b.user_id = ?
  `).get(bookingRef, req.user.id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const payment = db.prepare('SELECT * FROM payments WHERE booking_id = ?').get(booking.id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });
  if (payment.status === 'success') return res.status(400).json({ error: 'Already paid' });

  const txnId = `DEMO${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const paidAt = new Date().toISOString();

  db.prepare(`
    UPDATE payments SET status = 'success', method = ?, transaction_id = ?, paid_at = ? WHERE id = ?
  `).run(method, txnId, paidAt, payment.id);

  db.prepare("UPDATE bookings SET status = 'confirmed', updated_at = datetime('now') WHERE id = ?").run(booking.id);

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(booking.service_id);
  const updatedPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(payment.id);
  const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id);
  const user = { id: booking.user_id, name: booking.name, email: booking.email, phone: booking.phone };

  notifyPaymentSuccess(user, updatedBooking, updatedPayment);
  notifyBookingConfirmed(user, updatedBooking, service);

  res.json({
    success: true,
    message: 'Demo payment successful!',
    payment: updatedPayment,
    booking: updatedBooking,
    demoNote: 'This is a simulated payment. No real money was charged.'
  });
});

router.get('/status/:bookingRef', authenticate, (req, res) => {
  const payment = db.prepare(`
    SELECT p.* FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    WHERE b.booking_ref = ? AND b.user_id = ?
  `).get(req.params.bookingRef, req.user.id);

  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

module.exports = router;
