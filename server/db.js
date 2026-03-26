const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',           // Your pgAdmin username
  host: 'localhost',
  database: 'bloodbank',  // The name of the DB you created
  password: 'root',   // Your pgAdmin password
  port: 5432,
});

module.exports = pool;