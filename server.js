const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(bodyParser.urlencoded({ extended: true })); // ✅ Use for form data
app.use(express.static(__dirname));

// ✅ Updated to include `subject`
app.post('/submit-feedback', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    await pool.query(
      'INSERT INTO feedback(name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [name, email, subject, message]
    );
    res.json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error("Database insert error:", err);
    res.status(500).json({ message: 'Error saving feedback.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});