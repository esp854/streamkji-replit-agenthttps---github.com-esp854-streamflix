import { config } from "dotenv";

// Load environment variables
config();

console.log("Environment variables:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 50)}...` : 'Not set');
console.log("NODE_ENV:", process.env.NODE_ENV || 'Not set');
console.log("PORT:", process.env.PORT || 'Not set');

// Test database connection
import { pool } from './db';

pool.query('SELECT NOW()', (err: any, res: any) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connection successful!');
    console.log('Current time from database:', res.rows[0].now);
  }
  pool.end();
});