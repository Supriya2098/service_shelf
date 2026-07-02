const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(
  __dirname, '..', 'data',
  process.env.NODE_ENV === 'test' ? 'test.db' : 'sevasetu.db'
);
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('cache_size = -64000');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT DEFAULT 'Mumbai',
      role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS service_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      price REAL NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      image_url TEXT,
      rating REAL DEFAULT 4.5,
      review_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      features TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES service_categories(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_ref TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT NOT NULL,
      notes TEXT,
      total_amount REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL UNIQUE,
      payment_ref TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      method TEXT DEFAULT 'demo',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed', 'refunded')),
      transaction_id TEXT,
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      booking_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('email', 'sms', 'in_app')),
      channel TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'sent' CHECK(status IN ('pending', 'sent', 'failed')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
    CREATE INDEX IF NOT EXISTS idx_services_active_rating ON services(is_active, rating DESC);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
    CREATE INDEX IF NOT EXISTS idx_bookings_service_date ON bookings(service_id, booking_date, status);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
  `);
}

module.exports = { db, initDatabase };
