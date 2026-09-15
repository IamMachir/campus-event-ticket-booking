const crypto = require('crypto');
const db = require('../config/db');

// Only the sha256 hash of a reset token is stored - a database leak then
// does not expose usable reset links.
function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function createUser({ fullName, email, passwordHash, role = 'student' }) {
  const [result] = await db.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [fullName, email, passwordHash, role]
  );
  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await db.query(
    'SELECT id, full_name, email, role, profile_image, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

// Whitelisted profile fields only - callers never pass role through here.
async function updateUserProfile(id, { fullName, profileImage }) {
  const [result] = await db.query(
    'UPDATE users SET full_name = COALESCE(?, full_name), profile_image = COALESCE(?, profile_image) WHERE id = ?',
    [fullName !== undefined ? fullName : null, profileImage !== undefined ? profileImage : null, id]
  );
  return result.affectedRows > 0;
}

async function updateUserPassword(id, passwordHash) {
  const [result] = await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  return result.affectedRows > 0;
}

async function invalidateUserResetTokens(userId) {
  await db.query(
    'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
    [userId]
  );
}

async function createPasswordResetToken(userId, rawToken, ttlMinutes) {
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  await db.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );
}

// Valid = exists, not yet used, and not expired.
async function findValidResetToken(rawToken) {
  const [rows] = await db.query(
    'SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()',
    [sha256(rawToken)]
  );
  return rows[0] || null;
}

async function markResetTokenUsed(id) {
  await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [id]);
}

async function listUsers() {
  const [rows] = await db.query(
    'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
}

async function updateUserRole(id, role) {
  const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  return result.affectedRows > 0;
}

async function deleteUser(id) {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  updateUserPassword,
  invalidateUserResetTokens,
  createPasswordResetToken,
  findValidResetToken,
  markResetTokenUsed,
  listUsers,
  updateUserRole,
  deleteUser,
};
