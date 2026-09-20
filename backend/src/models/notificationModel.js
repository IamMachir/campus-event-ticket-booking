const db = require('../config/db');
async function createNotification({ userId, type = 'system', title, message, eventId = null }) {
  const [result] = await db.query('INSERT INTO notifications (user_id, type, title, message, event_id) VALUES (?, ?, ?, ?, ?)', [userId, type, title, message, eventId]);
  return result.insertId;
}
async function getNotifications(userId) {
  const [rows] = await db.query('SELECT id, type, title, message, event_id, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
  return rows;
}
async function markNotificationRead(id, userId) { await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]); }
async function markAllNotificationsRead(userId) { await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]); }
module.exports = { createNotification, getNotifications, markNotificationRead, markAllNotificationsRead };
