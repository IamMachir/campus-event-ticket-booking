const db = require('../config/db');
async function getFavoriteEventIds(userId) {
  const [rows] = await db.query('SELECT event_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map((row) => row.event_id);
}
async function addFavorite(userId, eventId) { await db.query('INSERT IGNORE INTO favorites (user_id, event_id) VALUES (?, ?)', [userId, eventId]); }
async function removeFavorite(userId, eventId) { await db.query('DELETE FROM favorites WHERE user_id = ? AND event_id = ?', [userId, eventId]); }
module.exports = { getFavoriteEventIds, addFavorite, removeFavorite };
