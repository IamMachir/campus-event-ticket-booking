const db = require('../config/db');

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
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = { createUser, findUserByEmail, findUserById };
