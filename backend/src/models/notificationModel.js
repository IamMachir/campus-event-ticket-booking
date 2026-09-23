const db = require('../config/db');
const crypto = require('crypto');

async function createNotification({
  userId,
  type = 'system',
  title,
  message,
  eventId = null,
  preference = null,
  notificationKey = null,
}) {
  const storedNotificationKey = notificationKey && notificationKey.length > 255
    ? crypto.createHash('sha256').update(notificationKey).digest('hex')
    : notificationKey;
  if (preference) {
    const [preferenceRows] = await db.query(
      `SELECT ${preference} AS enabled
       FROM notification_preferences
       WHERE user_id = ?`,
      [userId],
    );
    if (preferenceRows.length > 0 && !preferenceRows[0].enabled) return null;
  }

  // The key identifies one real-world event transition (or reminder period).
  // It is stronger than a time window and remains safe if the worker restarts.
  if (storedNotificationKey) {
    const [existing] = await db.query(
      'SELECT id FROM notifications WHERE notification_key = ? LIMIT 1',
      [storedNotificationKey],
    );
    if (existing.length > 0) return existing[0].id;
  } else if (eventId) {
    // Backwards-compatible dedupe for existing notification types.
    const [existing] = await db.query(
      `SELECT id FROM notifications
       WHERE user_id = ? AND type = ? AND event_id = ?
         AND created_at > (NOW() - INTERVAL 24 HOUR)
       LIMIT 1`,
      [userId, type, eventId]
    );
    if (existing.length > 0) return existing[0].id;
  }
  const [result] = await db.query(
    `INSERT INTO notifications
       (user_id, type, title, message, event_id, delivery_status, notification_key)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [userId, type, title, message, eventId, storedNotificationKey],
  );
  return result.insertId;
}
async function getNotifications(userId) {
  const [rows] = await db.query(
    `SELECT id, type, title, message, event_id, is_read, read_at,
            delivery_status, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId],
  );
  return rows;
}
async function getUnreadNotificationCount(userId) {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId],
  );
  return Number(rows[0]?.count || 0);
}
async function markNotificationRead(id, userId) {
  await db.query(
    'UPDATE notifications SET is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE id = ? AND user_id = ?',
    [id, userId],
  );
}
async function markAllNotificationsRead(userId) {
  await db.query(
    'UPDATE notifications SET is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE user_id = ?',
    [userId],
  );
}
module.exports = {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
};
