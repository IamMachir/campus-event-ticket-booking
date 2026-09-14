const { body, validationResult } = require('express-validator');
const { PUBLIC_ROLES, ALL_ROLES } = require('../constants/roles');

// Runs after a set of express-validator rules; returns 400 with details if any failed
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

// Public registration only ever accepts student/organizer - admin is
// rejected here and again in the controller (defense in depth).
const registerRules = [
  body('fullName').trim().isLength({ min: 2, max: 150 }).withMessage('Full name must be 2-150 characters'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(PUBLIC_ROLES).withMessage('Role must be student or organizer'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('fullName').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Full name must be 2-150 characters'),
  body('profileImage').optional({ checkFalsy: true }).isURL().withMessage('Profile image must be a valid URL'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required'),
];

const updateUserRoleRules = [
  body('role').isIn(ALL_ROLES).withMessage('Invalid role'),
];

const eventRules = [
  body('title').trim().notEmpty().withMessage('title is required'),
  body('startTime').isISO8601().withMessage('startTime must be a valid date'),
  body('endTime').optional({ checkFalsy: true }).isISO8601().withMessage('endTime must be a valid date'),
  body('capacity').isInt({ min: 1 }).withMessage('capacity must be a positive integer'),
  body('categoryId').optional({ checkFalsy: true }).isInt().withMessage('categoryId must be an integer'),
];

const bookingRules = [
  body('eventId').isInt({ min: 1 }).withMessage('eventId must be a valid id'),
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  updateUserRoleRules,
  eventRules,
  bookingRules,
};
