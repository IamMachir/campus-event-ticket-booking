const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { createUser, findUserByEmail } = require('../models/userModel');

/**
 * Registers a new user account.
 *
 * Security notes (OWASP A02: Cryptographic Failures / A07: Auth Failures):
 * - Passwords are never stored in plaintext; bcrypt hashes with a salt
 *   round of 10 before persisting.
 * - Duplicate emails are rejected to prevent silent account overwrites.
 *
 * @param {import('express').Request} req - body: { fullName, email, password, role? }
 * @param {import('express').Response} res
 * @returns {Promise<void>} 201 with the created user's public fields, or 4xx/5xx on failure.
 */
async function register(req, res) {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'fullName, email and password are required' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({ fullName, email, passwordHash, role });

    res.status(201).json({ id: userId, fullName, email, role: role || 'student' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
}

/**
 * Authenticates a user and issues a signed JWT.
 *
 * Deliberately returns the same generic "Invalid email or password" message
 * whether the email doesn't exist or the password is wrong, to avoid
 * leaking which emails are registered (user enumeration mitigation).
 *
 * @param {import('express').Request} req - body: { email, password }
 * @param {import('express').Response} res
 * @returns {Promise<void>} 200 with { token, user } on success, 401 on invalid credentials.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}

module.exports = { register, login };
