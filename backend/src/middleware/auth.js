const jwt = require('jsonwebtoken');

const JWT_OPTIONS = { algorithms: ['HS256'] };

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.split(' ')[1];
  if (!token || token.length < 10) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, JWT_OPTIONS);

    if (!payload.id || !payload.email || typeof payload.id !== 'number') {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    if (payload.role && !['customer', 'admin'].includes(payload.role)) {
      return res.status(401).json({ error: 'Invalid token role' });
    }

    req.user = { id: payload.id, email: payload.email, role: payload.role || 'customer' };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid or expired token';
    return res.status(401).json({ error: message });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
