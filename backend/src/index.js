require('dotenv').config();
const express = require('express');
const { initDb } = require('./setupDb');
const pool = require('./db');

const app = express();
app.use(express.json());

// Initialize DB & table
initDb();

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Get all notes
app.get('/notes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, text, created_at FROM notes ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new note
app.post('/notes', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (text) VALUES ($1) RETURNING id, text, created_at',
      [text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
