const db = require('../config/db');

async function createNotification({ userId, type = 'system', title, message, eventId = null }) {
  // Dedupe: avoid creating a duplicate notification with the same user + type +
  // event_id within a 24h window. This prevents repeated "1 day left" or
  // "expired" reminders from spamming the user on every processing cycle.
  if (eventId) {
    const [existing] = await db.query(
      `SELECT id FROM notifications
       WHERE user_id = ? AND type = ? AND event_id = ?
         AND created_at > (NOW() - INTERVAL 24 HOUR)
       LIMIT 1`,
      [userId, type, eventId]
    );
    if (existing.length > 0) return existing[0].id;
  }
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
