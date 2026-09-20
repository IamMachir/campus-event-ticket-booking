const db = require('../config/db');
const { EVENT_CATEGORIES } = require('../constants/eventCategories');

async function createEvent({ title, description, categoryId, organizerId, location, startTime, endTime, capacity }) {
  const [result] = await db.query(
    `INSERT INTO events (title, description, category_id, organizer_id, location, start_time, end_time, capacity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || null,
      categoryId || null,
      organizerId,
      location || null,
      startTime,
      endTime || null,
      capacity,
    ]
  );
  return result.insertId;
}

async function getCategories() {
  const placeholders = EVENT_CATEGORIES.map(() => '?').join(', ');
  const [rows] = await db.query(
    `SELECT id, name
     FROM categories
     WHERE name IN (${placeholders})
     ORDER BY FIELD(name, ${placeholders})`,
    [...EVENT_CATEGORIES, ...EVENT_CATEGORIES]
  );
  return rows;
}

async function getCategoryById(id) {
  const [rows] = await db.query(
    `SELECT id, name
     FROM categories
     WHERE id = ? AND name IN (${EVENT_CATEGORIES.map(() => '?').join(', ')})`,
    [id, ...EVENT_CATEGORIES]
  );
  return rows[0] || null;
}

function escapeLikePattern(value) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

async function searchEvents({ search = '', categoryId = null, page = 1, limit = 12 }) {
  const conditions = [];
  const params = [];
  const normalizedSearch = search.trim().toLowerCase();

  if (normalizedSearch) {
    const pattern = `%${escapeLikePattern(normalizedSearch)}%`;
    conditions.push(`(
      LOWER(e.title) LIKE ? ESCAPE '\\\\'
      OR LOWER(COALESCE(u.full_name, '')) LIKE ? ESCAPE '\\\\'
      OR LOWER(COALESCE(c.name, '')) LIKE ? ESCAPE '\\\\'
      OR LOWER(COALESCE(e.location, '')) LIKE ? ESCAPE '\\\\'
    )`);
    params.push(pattern, pattern, pattern, pattern);
  }

  if (categoryId !== null) {
    conditions.push('e.category_id = ?');
    params.push(categoryId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  const countParams = [...params];

  const [countResult, eventResult] = await Promise.all([
    db.query(
      `SELECT COUNT(*) AS total
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.organizer_id = u.id
       ${whereClause}`,
      countParams
    ),
    db.query(
      `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.organizer_id = u.id
       ${whereClause}
       ORDER BY e.start_time ASC, e.id ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
  ]);

  return {
    events: eventResult[0],
    total: Number(countResult[0][0]?.total || 0),
  };
}

async function getAllEvents() {
  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name
     FROM events e
     LEFT JOIN categories c ON e.category_id = c.id
     LEFT JOIN users u ON e.organizer_id = u.id
     ORDER BY e.start_time ASC`
  );
  return rows;
}

async function getEventsByOrganizer(organizerId) {
  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name
     FROM events e
     LEFT JOIN categories c ON e.category_id = c.id
     LEFT JOIN users u ON e.organizer_id = u.id
     WHERE e.organizer_id = ?
     ORDER BY e.start_time ASC`,
    [organizerId]
  );
  return rows;
}

async function getEventById(id) {
  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name
     FROM events e
     LEFT JOIN categories c ON e.category_id = c.id
     LEFT JOIN users u ON e.organizer_id = u.id
     WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function incrementSeatsBooked(eventId) {
  await db.query('UPDATE events SET seats_booked = seats_booked + 1 WHERE id = ?', [eventId]);
}

async function decrementSeatsBooked(eventId) {
  await db.query('UPDATE events SET seats_booked = GREATEST(seats_booked - 1, 0) WHERE id = ?', [eventId]);
}

async function updateEvent(id, { title, description, categoryId, location, startTime, endTime, capacity }) {
  await db.query(
    `UPDATE events SET title = ?, description = ?, category_id = ?, location = ?,
     start_time = ?, end_time = ?, capacity = ? WHERE id = ?`,
    [
      title,
      description || null,
      categoryId || null,
      location || null,
      startTime,
      endTime || null,
      capacity,
      id,
    ]
  );
}

async function deleteEvent(id) {
  await db.query('DELETE FROM events WHERE id = ?', [id]);
}

// Per-event booking/check-in breakdown for an organizer's analytics dashboard
async function getOrganizerStats(organizerId) {
  const [rows] = await db.query(
    `SELECT
       e.id,
       e.title,
       e.capacity,
       e.seats_booked,
       COUNT(CASE WHEN b.status = 'checked_in' THEN 1 END) AS checked_in_count,
       COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) AS cancelled_count
     FROM events e
     LEFT JOIN bookings b ON b.event_id = e.id
     WHERE e.organizer_id = ?
     GROUP BY e.id
     ORDER BY e.start_time ASC`,
    [organizerId]
  );
  return rows;
}

module.exports = {
  createEvent,
  getCategories,
  getCategoryById,
  searchEvents,
  getAllEvents,
  getEventsByOrganizer,
  getEventById,
  incrementSeatsBooked,
  decrementSeatsBooked,
  updateEvent,
  deleteEvent,
  getOrganizerStats,
};
