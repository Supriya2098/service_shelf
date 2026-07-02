const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DB_PATH = path.join(__dirname, '..', 'data', 'test.db');

const { initDatabase } = require('../src/database');
initDatabase();
