const db = require('../config/db');
async function getFavoriteEventIds(userId) {
  const [rows] = await db.query('SELECT event_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map((row) => row.event_id);
}
async function getFavoriteEvents(userId, search = '') {
  const pattern = `%${search.trim().toLowerCase()}%`;
  const [rows] = await db.query(
    `SELECT e.*, c.name AS category_name, u.full_name AS organizer_name,
            f.created_at AS saved_at
     FROM favorites f
     JOIN events e ON e.id = f.event_id
     LEFT JOIN categories c ON e.category_id = c.id
     LEFT JOIN users u ON e.organizer_id = u.id
     WHERE f.user_id = ?
       AND (
         ? = '' OR LOWER(e.title) LIKE ? OR LOWER(COALESCE(e.location, '')) LIKE ?
         OR LOWER(COALESCE(c.name, '')) LIKE ?
       )
     ORDER BY f.created_at DESC`,
    [userId, search.trim(), pattern, pattern, pattern],
  );
  return rows;
}
async function addFavorite(userId, eventId) { await db.query('INSERT IGNORE INTO favorites (user_id, event_id) VALUES (?, ?)', [userId, eventId]); }
async function removeFavorite(userId, eventId) { await db.query('DELETE FROM favorites WHERE user_id = ? AND event_id = ?', [userId, eventId]); }
module.exports = { getFavoriteEventIds, getFavoriteEvents, addFavorite, removeFavorite };
