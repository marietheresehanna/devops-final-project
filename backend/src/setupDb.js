const pool = require('./db');

async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ Notes table is ready');
  } catch (err) {
    console.error('❌ Error creating notes table:', err);
  }
}

module.exports = { initDb };
