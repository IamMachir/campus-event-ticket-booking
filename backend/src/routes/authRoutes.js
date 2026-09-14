const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  handleValidation,
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  updateUserRoleRules,
} = require('../middleware/validation');
const { ROLES } = require('../constants/roles');

// Public
router.post('/register', registerRules, handleValidation, authController.register);
router.post('/login', loginRules, handleValidation, authController.login);
router.post('/forgot-password', forgotPasswordRules, handleValidation, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, handleValidation, authController.resetPassword);

// Authenticated user (any role)
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.put('/me', requireAuth, updateProfileRules, handleValidation, authController.updateProfile);
router.post('/me/password', requireAuth, changePasswordRules, handleValidation, authController.changePassword);

// Admin only
router.get('/users', requireAuth, requireRole(ROLES.ADMIN), authController.listUsers);
router.put('/users/:userId/role', requireAuth, requireRole(ROLES.ADMIN), updateUserRoleRules, handleValidation, authController.updateUserRole);

module.exports = router;
