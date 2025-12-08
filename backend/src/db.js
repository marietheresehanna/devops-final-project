const { Pool } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_pass',
  database: process.env.DB_NAME || 'notes_db',
};

console.log('🔧 [DB CONFIG USED BY NODE]', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
});

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('✅ [DB] Connected to PostgreSQL (from Node)');
});

pool.on('error', (err) => {
  console.error('❌ [DB] PostgreSQL connection error:', err);
});

module.exports = pool;
