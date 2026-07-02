const { db } = require('../database');

function sendNotification({ userId, bookingId, type, channel, subject, message }) {
  const result = db.prepare(`
    INSERT INTO notifications (user_id, booking_id, type, channel, subject, message, status)
    VALUES (?, ?, ?, ?, ?, ?, 'sent')
  `).run(userId, bookingId || null, type, channel, subject || null, message);

  const label = type === 'email' ? 'EMAIL' : type === 'sms' ? 'SMS' : 'IN-APP';
  console.log(`\n[${label}] To: ${channel}`);
  if (subject) console.log(`  Subject: ${subject}`);
  console.log(`  ${message}\n`);

  return result.lastInsertRowid;
}

function notifyBookingConfirmed(user, booking, service) {
  const date = new Date(booking.booking_date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  sendNotification({
    userId: user.id, bookingId: booking.id, type: 'email', channel: user.email,
    subject: `Booking Confirmed - ${booking.booking_ref}`,
    message: `Dear ${user.name}, your booking for "${service.name}" is confirmed!\nRef: ${booking.booking_ref}\nDate: ${date} at ${booking.time_slot}\nAmount: ₹${booking.total_amount}\nAddress: ${booking.address}, ${booking.city}`
  });

  if (user.phone) {
    sendNotification({
      userId: user.id, bookingId: booking.id, type: 'sms', channel: user.phone,
      message: `SERVICE SHELF: Booking ${booking.booking_ref} confirmed for ${service.name} on ${date} at ${booking.time_slot}. Rs.${booking.total_amount}.`
    });
  }

  sendNotification({
    userId: user.id, bookingId: booking.id, type: 'in_app', channel: 'dashboard',
    subject: 'Booking Confirmed',
    message: `Your ${service.name} booking on ${date} at ${booking.time_slot} is confirmed.`
  });
}

function notifyPaymentSuccess(user, booking, payment) {
  sendNotification({
    userId: user.id, bookingId: booking.id, type: 'email', channel: user.email,
    subject: `Payment Received - ${payment.payment_ref}`,
    message: `Dear ${user.name}, payment of ₹${payment.amount} received for ${booking.booking_ref}. Txn: ${payment.transaction_id}`
  });
  if (user.phone) {
    sendNotification({
      userId: user.id, bookingId: booking.id, type: 'sms', channel: user.phone,
      message: `SERVICE SHELF: Payment Rs.${payment.amount} received. Txn: ${payment.transaction_id}`
    });
  }
}

function notifyStatusUpdate(user, booking, service, newStatus) {
  const labels = { confirmed: 'confirmed', in_progress: 'in progress', completed: 'completed', cancelled: 'cancelled' };
  sendNotification({
    userId: user.id, bookingId: booking.id, type: 'in_app', channel: 'dashboard',
    subject: `Booking Updated`,
    message: `Your ${service.name} (${booking.booking_ref}) is now ${labels[newStatus] || newStatus}.`
  });
}

module.exports = { sendNotification, notifyBookingConfirmed, notifyPaymentSuccess, notifyStatusUpdate };
