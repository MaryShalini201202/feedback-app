const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config(); // Loads the .env file

const app = express();
const port = process.env.PORT || 3000;

// Connect to PostgreSQL using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Needed if you're using Render or other cloud services
});

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serves index.html from this folder

// Route to handle feedback form submission
app.post('/submit-feedback', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await pool.query(
      'INSERT INTO feedback(name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving feedback.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});