const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config(); // Loads the .env file

const app = express();
const port = process.env.PORT || 3000;

// ✅ Connect to PostgreSQL using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for cloud databases like Render
});

// ✅ Parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static files (like index.html) from this directory
app.use(express.static(__dirname));

// ✅ Route to handle feedback form submission
app.post('/submit-feedback', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // ✅ Log received data for debugging
  console.log("📦 Received form data:", req.body);

  try {
    await pool.query(
      'INSERT INTO feedback(name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [name, email, subject, message]
    );
    res.status(200).json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error("❌ Database insert error:", err);
    res.status(500).json({ message: 'Error saving feedback.' });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});