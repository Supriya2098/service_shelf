const express = require('express');
const { db } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/me', authenticate, (req, res) => {
  const { name, phone, address, city } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), city = COALESCE(?, city) WHERE id = ?')
    .run(name, phone, address, city, req.user.id);

  const user = db.prepare('SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

router.get('/notifications', authenticate, (req, res) => {
  const notifications = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.user.id);
  res.json(notifications);
});

module.exports = router;
