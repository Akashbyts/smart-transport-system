require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@bustracking.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const name = 'Super Admin';

  const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    console.log('Admin already exists. Skipping seed.');
    await pool.end();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO admins (id, name, email, password) VALUES ($1, $2, $3, $4)',
    [uuidv4(), name, email, hashedPassword]
  );

  console.log(`Admin seeded: ${email} / ${password}`);
  await pool.end();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});