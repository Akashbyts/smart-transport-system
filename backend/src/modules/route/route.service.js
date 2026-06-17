const { v4: uuidv4 } = require('uuid');
const { query } = require('../../config/database');
const { createError } = require('../../middleware/errorHandler');

async function createRoute(data) {
  const { route_number, route_name, start_location, end_location, stops, estimated_duration_minutes } = data;

  const existing = await query('SELECT id FROM routes WHERE route_number = $1', [route_number]);
  if (existing.rows.length > 0) throw createError('Route number already exists', 409);

  const id = uuidv4();
  const result = await query(
    `INSERT INTO routes (id, route_number, route_name, start_location, end_location,
                         stops, estimated_duration_minutes, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW()) RETURNING *`,
    [id, route_number, route_name, start_location, end_location,
     JSON.stringify(stops), estimated_duration_minutes || null]
  );
  return result.rows[0];
}

async function getAllRoutes(limit = 50, offset = 0) {
  const result = await query(
    'SELECT * FROM routes WHERE is_active = true ORDER BY route_number LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  const count = await query('SELECT COUNT(*) FROM routes WHERE is_active = true');
  return { routes: result.rows, total: parseInt(count.rows[0].count) };
}

async function getRouteById(routeId) {
  const result = await query('SELECT * FROM routes WHERE id = $1', [routeId]);
  if (result.rows.length === 0) throw createError('Route not found', 404);
  return result.rows[0];
}

async function updateRoute(routeId, data) {
  const fields = [];
  const values = [routeId];
  let idx = 2;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${idx++}`);
    values.push(key === 'stops' ? JSON.stringify(value) : value);
  }

  fields.push('updated_at = NOW()');

  const result = await query(
    `UPDATE routes SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );
  if (result.rows.length === 0) throw createError('Route not found', 404);
  return result.rows[0];
}

module.exports = { createRoute, getAllRoutes, getRouteById, updateRoute };