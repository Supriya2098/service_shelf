const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { validateEmail } = require('../middleware/security');

const router = express.Router();

const JWT_SIGN_OPTIONS = { expiresIn: '7d', algorithm: 'HS256' };

router.post('/register', (req, res) => {
  const { name, email, password, phone, address, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, phone, address, city) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, email.toLowerCase(), hash, phone || null, address || null, city || 'Mumbai');

  const user = db.prepare('SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, JWT_SIGN_OPTIONS);

  res.status(201).json({ user, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...safeUser } = user;
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, JWT_SIGN_OPTIONS);
  res.json({ user: safeUser, token });
});

module.exports = router;
