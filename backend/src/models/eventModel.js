const db = require('../config/db');

async function createEvent({ title, description, categoryId, organizerId, location, startTime, endTime, capacity }) {
  const [result] = await db.query(
    `INSERT INTO events (title, description, category_id, organizer_id, location, start_time, end_time, capacity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, categoryId, organizerId, location, startTime, endTime, capacity]
  );
  return result.insertId;
}

async function getAllEvents() {
  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name
     FROM events e
     LEFT JOIN categories c ON e.category_id = c.id
     ORDER BY e.start_time ASC`
  );
  return rows;
}

async function getEventById(id) {
  const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
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
    [title, description, categoryId, location, startTime, endTime, capacity, id]
  );
}

async function deleteEvent(id) {
  await db.query('DELETE FROM events WHERE id = ?', [id]);
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  incrementSeatsBooked,
  decrementSeatsBooked,
  updateEvent,
  deleteEvent,
};
