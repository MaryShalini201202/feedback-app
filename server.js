const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 3000;

// ✅ Connect to PostgreSQL using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Important for cloud DB like Render
});

// ✅ Parse URL-encoded form data from HTML forms
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve static files like index.html
app.use(express.static(__dirname));

// ✅ Handle form submission (POST /submit-feedback)
app.post('/submit-feedback', async (req, res) => {
  const { name, email, subject, message } = req.body;

  console.log("📨 Received submission:", req.body);

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

// ✅ Show all feedback at /view-feedback
app.get('/view-feedback', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedback ORDER BY id DESC');

    let tableRows = result.rows.map(row => `
      <tr>
        <td>${row.name}</td>
        <td>${row.email}</td>
        <td>${row.subject}</td>
        <td>${row.message}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Submitted Feedback</title>
        <style>
          body { font-family: Arial; background: #f4f4f4; padding: 20px; }
          h2 { text-align: center; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          th, td {
            padding: 12px 15px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #38f9d7;
            color: #333;
          }
        </style>
      </head>
      <body>
        <h2>All Submitted Feedback</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error("❌ Error fetching feedback:", err);
    res.status(500).send("Error retrieving feedback.");
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});