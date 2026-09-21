const db = require('../config/db');
const { EVENT_CATEGORIES } = require('../constants/eventCategories');
const { DISCOVERY_VIEWS } = require('../constants/discoveryViews');
const { getCampusDayBounds, getCampusNow, getCampusTomorrowBounds } = require('../utils/campusTime');

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

function buildDiscoveryQuery({ view = 'all', search = '', categoryId = null, now = new Date() }) {
  const conditions = [];
  const params = [];
  const normalizedSearch = search.trim().toLowerCase();

  conditions.push("e.status = 'PUBLISHED'");

  if (view === 'all') {
    // Exclude events whose entire campus-local day has already passed so they
    // no longer appear on the home/discovery feed. An event day is "past" once
    // the campus-local calendar has rolled over to the next day.
    const { start: tomorrowStart } = getCampusTomorrowBounds(now);
    conditions.push('e.start_time >= ?');
    params.push(tomorrowStart);
  }

  if (view === 'upcoming' || view === 'popular') {
    conditions.push('e.start_time > ?');
    params.push(getCampusNow(now));
  } else if (view === 'today') {
    const { start, end } = getCampusDayBounds(now);
    conditions.push('e.start_time < ? AND COALESCE(e.end_time, e.start_time) >= ?');
    params.push(end, start);
  }

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
  const joins = view === 'popular'
    ? `LEFT JOIN bookings b ON b.event_id = e.id`
    : '';
  const whereParams = [...params];
  const orderParams = [];
  let orderBy = 'e.start_time ASC, e.id ASC';
  if (view === 'all') {
    orderBy = 'e.start_time ASC, e.id ASC';
  } else if (view === 'popular') {
    // Popularity is confirmed bookings for upcoming published events; cancelled bookings do not count.
    orderBy = "COUNT(CASE WHEN b.status IN ('booked', 'checked_in') THEN 1 END) DESC, e.start_time ASC, e.id ASC";
  }

  return { conditions, whereParams, orderParams, joins, whereClause, orderBy };
}

async function searchEvents({ view = 'all', search = '', categoryId = null, page = 1, limit = 12 }) {
  if (!DISCOVERY_VIEWS.includes(view)) {
    throw new Error('Invalid discovery view');
  }

  const query = buildDiscoveryQuery({ view, search, categoryId });
  const countParams = [...query.whereParams];
  const offset = (page - 1) * limit;
  const groupBy = view === 'popular' ? 'GROUP BY e.id' : '';
  const countExpression = view === 'popular' ? 'COUNT(DISTINCT e.id)' : 'COUNT(*)';

  const [countResult, eventResult] = await Promise.all([
    db.query(
      `SELECT ${countExpression} AS total
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.organizer_id = u.id
       ${query.joins}
       ${query.whereClause}`,
      countParams
    ),
    db.query(
      `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN users u ON e.organizer_id = u.id
       ${query.joins}
       ${query.whereClause}
       ${groupBy}
       ORDER BY ${query.orderBy}
       LIMIT ? OFFSET ?`,
      [...query.whereParams, ...query.orderParams, limit, offset]
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
  buildDiscoveryQuery,
  getAllEvents,
  getEventsByOrganizer,
  getEventById,
  incrementSeatsBooked,
  decrementSeatsBooked,
  updateEvent,
  deleteEvent,
  getOrganizerStats,
};
