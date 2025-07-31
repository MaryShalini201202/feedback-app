const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config(); // Loads the .env file

const app = express();
const port = process.env.PORT || 3000;

// Connect to PostgreSQL using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Needed for Render
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serves index.html

// Handle form submission
app.post('/submit-feedback', async (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("📨 New submission:", req.body);

  try {
    await pool.query(
      'INSERT INTO feedback(name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [name, email, subject, message]
    );
    res.json({ message: '✅ Feedback submitted successfully.' });
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ message: '❌ Error saving feedback.' });
  }
});

// Provide feedback data as JSON
app.get('/api/feedback', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedback ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching feedback:", err);
    res.status(500).json({ error: 'Error loading feedback.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});