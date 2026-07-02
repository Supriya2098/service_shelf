require('dotenv').config();
const { initDatabase } = require('./database');
const { createApp } = require('./app');

initDatabase();

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n  SERVICE SHELF API running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});
