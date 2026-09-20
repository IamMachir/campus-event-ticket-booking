const db = require('../config/db');
async function getEventRating(eventId) {
  const [rows] = await db.query('SELECT ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS rating_count FROM ratings WHERE event_id = ?', [eventId]);
  return { averageRating: Number(rows[0]?.average_rating || 0), ratingCount: Number(rows[0]?.rating_count || 0) };
}
async function getUserRating(eventId, userId) {
  const [rows] = await db.query('SELECT id, rating, comment, created_at, updated_at FROM ratings WHERE event_id = ? AND user_id = ?', [eventId, userId]);
  return rows[0] || null;
}
async function upsertRating(eventId, userId, rating, comment) {
  await db.query('INSERT INTO ratings (event_id, user_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)', [eventId, userId, rating, comment || null]);
}
module.exports = { getEventRating, getUserRating, upsertRating };
