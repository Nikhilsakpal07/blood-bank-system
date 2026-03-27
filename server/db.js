require('dotenv').config();
const { Pool } = require('pg');

const isLocalhost = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // --- MULTI-ENVIRONMENT FIX ---
  // If it's local, no SSL. If it's Cloud (Render), SSL is MANDATORY.
  ssl: isLocalhost 
    ? false 
    : { rejectUnauthorized: false }
});

// Add this to see the connection status in your Render logs!
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database connection error:', err.stack);
  }
  console.log('✅ Successfully connected to PostgreSQL database!');
  release();
});

module.exports = pool;