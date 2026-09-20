const { body, validationResult } = require('express-validator');
const { PUBLIC_ROLES, ALL_ROLES } = require('../constants/roles');

const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

function isStrongPassword(value) {
  return typeof value === 'string'
    && value.length >= 8
    && /[a-z]/.test(value)
    && /[A-Z]/.test(value)
    && /\d/.test(value)
    && /[^A-Za-z0-9]/.test(value);
}

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
  body('password').custom(isStrongPassword).withMessage(STRONG_PASSWORD_MESSAGE),
  body('role').optional().isIn(PUBLIC_ROLES).withMessage('Role must be student or organizer'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('fullName').optional().trim().isLength({ min: 2, max: 150 }).withMessage('Full name must be 2-150 characters'),
  body('profileImage')
    .optional({ checkFalsy: true })
    .custom((value) => (
      (typeof value === 'string' && value.length <= 2_000_000)
      && (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(value) || /^https?:\/\//i.test(value))
    ))
    .withMessage('Profile image must be a valid HTTP image URL or image file'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').custom(isStrongPassword).withMessage(`New ${STRONG_PASSWORD_MESSAGE.toLowerCase()}`),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').custom(isStrongPassword).withMessage(`New ${STRONG_PASSWORD_MESSAGE.toLowerCase()}`),
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
  body('categoryId').isInt({ min: 1 }).withMessage('categoryId must be a positive integer'),
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
  STRONG_PASSWORD_MESSAGE,
  isStrongPassword,
};
