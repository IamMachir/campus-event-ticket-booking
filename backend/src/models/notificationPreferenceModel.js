const db = require('../config/db');

const DEFAULT_PREFERENCES = Object.freeze({
  approachingEnabled: true,
  dateChangeEnabled: true,
  locationChangeEnabled: true,
  interestMatchEnabled: true,
  emailEnabled: false,
  pushEnabled: false,
});

const preferenceColumns = {
  approachingEnabled: 'approaching_enabled',
  dateChangeEnabled: 'date_change_enabled',
  locationChangeEnabled: 'location_change_enabled',
  interestMatchEnabled: 'interest_match_enabled',
  emailEnabled: 'email_enabled',
  pushEnabled: 'push_enabled',
};

function mapPreferences(row) {
  return Object.keys(preferenceColumns).reduce((result, key) => {
    result[key] = row ? Boolean(row[preferenceColumns[key]]) : DEFAULT_PREFERENCES[key];
    return result;
  }, {});
}

async function getNotificationPreferences(userId) {
  const [rows] = await db.query('SELECT * FROM notification_preferences WHERE user_id = ?', [userId]);
  return mapPreferences(rows[0]);
}

async function updateNotificationPreferences(userId, values) {
  const current = await getNotificationPreferences(userId);
  const next = { ...current };
  Object.keys(preferenceColumns).forEach((key) => {
    if (typeof values[key] === 'boolean') next[key] = values[key];
  });

  await db.query(
    `INSERT INTO notification_preferences
       (user_id, approaching_enabled, date_change_enabled, location_change_enabled,
        interest_match_enabled, email_enabled, push_enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       approaching_enabled = VALUES(approaching_enabled),
       date_change_enabled = VALUES(date_change_enabled),
       location_change_enabled = VALUES(location_change_enabled),
       interest_match_enabled = VALUES(interest_match_enabled),
       email_enabled = VALUES(email_enabled),
       push_enabled = VALUES(push_enabled)`,
    [
      userId,
      next.approachingEnabled,
      next.dateChangeEnabled,
      next.locationChangeEnabled,
      next.interestMatchEnabled,
      next.emailEnabled,
      next.pushEnabled,
    ],
  );
  return next;
}

async function getInterestIds(userId) {
  const [rows] = await db.query(
    'SELECT category_id FROM user_interests WHERE user_id = ? ORDER BY category_id',
    [userId],
  );
  return rows.map((row) => row.category_id);
}

async function replaceInterests(userId, categoryIds) {
  const uniqueIds = [...new Set(categoryIds)];
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM user_interests WHERE user_id = ?', [userId]);
    if (uniqueIds.length > 0) {
      const values = uniqueIds.map((categoryId) => [userId, categoryId]);
      await conn.query('INSERT INTO user_interests (user_id, category_id) VALUES ?', [values]);
    }
    await conn.commit();
    return uniqueIds;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function getUsersInterestedInCategory(categoryId) {
  const [rows] = await db.query(
    `SELECT ui.user_id
     FROM user_interests ui
     JOIN users u ON u.id = ui.user_id
     WHERE ui.category_id = ? AND u.role = 'student'`,
    [categoryId],
  );
  return rows.map((row) => row.user_id);
}

module.exports = {
  DEFAULT_PREFERENCES,
  getNotificationPreferences,
  updateNotificationPreferences,
  getInterestIds,
  replaceInterests,
  getUsersInterestedInCategory,
};