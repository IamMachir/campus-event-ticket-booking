const { body, validationResult } = require('express-validator');

// Runs after a set of express-validator rules; returns 400 with details if any failed
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

const registerRules = [
  body('fullName').trim().notEmpty().withMessage('fullName is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'organizer', 'admin']).withMessage('Invalid role'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
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

module.exports = { handleValidation, registerRules, loginRules, eventRules, bookingRules };
