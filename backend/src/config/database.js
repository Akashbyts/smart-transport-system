const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'bus_tracking',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,  // fail after 5 seconds
  query_timeout: 10000,           // query timeout 10 seconds
  statement_timeout: 10000
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error:', err);
});

async function connectDatabase() {
  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
}

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    logger.warn('Slow query detected', { text, duration });
  }
  return result;
}

async function getClient() {
  return pool.connect();
}

module.exports = { pool, query, getClient, connectDatabase };