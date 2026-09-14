const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const { ROLES, PUBLIC_ROLES } = require('../constants/roles');
const userModel = require('../models/userModel');
const { sendPasswordResetEmail } = require('../utils/email');

const RESET_TOKEN_TTL_MINUTES = 60;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Single place that decides which user fields may ever leave the API.
// password_hash and reset tokens are never included.
function toSafeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    profileImage: user.profile_image || null,
    createdAt: user.created_at,
    updatedAt: user.updated_at || undefined,
  };
}

/**
 * Registers a new user account. Roles are limited to the public set
 * (student/organizer); admin accounts cannot be created through public
 * sign-up - the controller rejects the role even if a client bypasses
 * the frontend and sends role=admin directly.
 */
async function register(req, res) {
  try {
    const { fullName, email, password, role } = req.body;

    const requestedRole = role || ROLES.STUDENT;
    if (!PUBLIC_ROLES.includes(requestedRole)) {
      return res.status(400).json({ error: 'Role must be student or organizer' });
    }

    const existing = await userModel.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({ fullName, email, passwordHash, role: requestedRole });

    res.status(201).json({ id: userId, fullName, email, role: requestedRole });
  } catch (err) {
    console.error('Registration failed:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

/**
 * Authenticates a user and issues a signed JWT. Returns the same generic
 * message whether the email is unknown or the password is wrong, so the
 * response cannot be used to enumerate registered emails.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ token: signToken(user), user: toSafeUser(user) });
  } catch (err) {
    console.error('Login failed:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

/**
 * Logout endpoint. JWT auth is stateless, so an unexpired token cannot be
 * revoked server-side without extra infrastructure; the client completes
 * logout by discarding the stored token. This endpoint confirms the caller
 * was authenticated and gives the flow one standard place to hook into
 * (e.g. token blocklisting later).
 */
async function logout(req, res) {
  res.json({ message: 'Logged out successfully' });
}

/** Returns the authenticated caller's own profile. */
async function getMe(req, res) {
  try {
    const user = await userModel.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error('Failed to load current user:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

/**
 * Updates the caller's own profile. Only explicitly whitelisted fields
 * (fullName, profileImage) are read from the body - anything else the
 * client sends, such as role, is silently ignored and can never be
 * persisted through this endpoint.
 */
async function updateProfile(req, res) {
  try {
    const { fullName, profileImage } = req.body;
    await userModel.updateUserProfile(req.user.id, { fullName, profileImage });
    const user = await userModel.findUserById(req.user.id);
    res.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error('Failed to update profile:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

/** Changes the caller's password after verifying the current one. */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const user = await userModel.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userModel.updateUserPassword(user.id, passwordHash);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Failed to change password:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

/**
 * Requests a password reset. Always returns the same generic response
 * whether or not the email exists. If it does: previous tokens are
 * invalidated, a fresh random token is stored (sha256-hashed, 60 minute
 * expiry) and reset instructions are emailed.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await userModel.findUserByEmail(email);
    if (user) {
      await userModel.invalidateUserResetTokens(user.id);
      const rawToken = crypto.randomBytes(32).toString('hex');
      await userModel.createPasswordResetToken(user.id, rawToken, RESET_TOKEN_TTL_MINUTES);

      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      await sendPasswordResetEmail({
        toEmail: user.email,
        toName: user.full_name,
        resetUrl: frontendUrl + '/reset-password?token=' + rawToken,
      });
    }
    res.json({ message: 'If an account exists with this email, password reset instructions have been sent' });
  } catch (err) {
    console.error('Failed to process password reset request:', err.message);
    res.json({ message: 'If an account exists with this email, password reset instructions have been sent' });
  }
}

/**
 * Confirms a password reset: validates the token (must exist, be unused
 * and unexpired), updates the password, then burns the token and every
 * other outstanding token for that user so no token can be reused.
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const resetRecord = await userModel.findValidResetToken(token);
    if (!resetRecord) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }

    const user = await userModel.findUserById(resetRecord.user_id);
    if (!user) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userModel.updateUserPassword(user.id, passwordHash);
    await userModel.markResetTokenUsed(resetRecord.id);
    await userModel.invalidateUserResetTokens(user.id);

    res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (err) {
    console.error('Failed to reset password:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

/** Admin only: lists all users (safe fields only). */
async function listUsers(req, res) {
  try {
    const users = await userModel.listUsers();
    res.json({ users });
  } catch (err) {
    console.error('Failed to list users:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

/**
 * Admin only: changes another user's role. A user cannot change their own
 * role here - that guard prevents an admin from accidentally locking
 * themselves out of admin functions.
 */
async function updateUserRole(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { role } = req.body;

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const updated = await userModel.updateUserRole(userId, role);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('Failed to update user role:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  listUsers,
  updateUserRole,
};
