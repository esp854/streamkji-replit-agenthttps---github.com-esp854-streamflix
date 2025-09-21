const { Pool } = require('pg');

// Try to connect to the database
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'streamkji',
  password: 'postgres', // Default password, change if needed
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Successfully connected to database:', res.rows[0]);
  }
  pool.end();
});