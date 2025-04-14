const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost/gradeconverter',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Create users table (run once)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      university TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Database ready');
}
initDB();

// API endpoint: Signup
app.post('/api/signup', async (req, res) => {
  const { username, password, university } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, university) VALUES ($1, $2, $3) RETURNING *',
      [username, password, university]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Username already exists' });
  }
});

// API endpoint: Get total users
app.get('/api/users/count', async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) FROM users');
  res.json({ count: parseInt(result.rows[0].count) });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
