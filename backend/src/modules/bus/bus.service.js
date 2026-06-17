const { v4: uuidv4 } = require('uuid');
const { query } = require('../../config/database');
const { createError } = require('../../middleware/errorHandler');

async function createBus(data) {
  const { bus_number, capacity, model, year } = data;
  const existing = await query('SELECT id FROM buses WHERE bus_number = $1', [bus_number]);
  if (existing.rows.length > 0) throw createError('Bus number already exists', 409);

  const id = uuidv4();
  const result = await query(
    `INSERT INTO buses (id, bus_number, capacity, model, year, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW())
     RETURNING *`,
    [id, bus_number, capacity, model || null, year || null]
  );
  return result.rows[0];
}

async function getAllBuses(limit = 20, offset = 0) {
  const result = await query(
    'SELECT * FROM buses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  const count = await query('SELECT COUNT(*) FROM buses');
  return { buses: result.rows, total: parseInt(count.rows[0].count) };
}

async function updateBus(busId, data) {
  const fields = Object.keys(data).map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = Object.values(data);
  const result = await query(
    `UPDATE buses SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [busId, ...values]
  );
  if (result.rows.length === 0) throw createError('Bus not found', 404);
  return result.rows[0];
}

async function deleteBus(busId) {
  const result = await query(
    'UPDATE buses SET is_active = false WHERE id = $1 RETURNING id',
    [busId]
  );
  if (result.rows.length === 0) throw createError('Bus not found', 404);
  return result.rows[0];
}

module.exports = { createBus, getAllBuses, updateBus, deleteBus };