const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'COURSES_db'
});

app.get('/courses', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'Missing start or end parameter' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT code, startTime, endTime, seatsAvailable, seatsTotal, name FROM courses WHERE startTime = ? AND endTime = ?',
      [start, end]
    );

    const courses = [];
    rows.forEach(row => {
      const seats = row.seatsTotal - row.seatsAvailable;
      if (seats > 0) {
        courses.push({
          code: row.code,
          seats: seats,
          name: row.name
        });
      }
    });

    res.json({
      count: rows.length,
      courses: courses
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Try: http://localhost:3000/courses?start=130&end=230`);
});