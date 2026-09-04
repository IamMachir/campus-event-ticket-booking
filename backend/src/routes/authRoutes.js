const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { handleValidation, registerRules, loginRules } = require('../middleware/validation');

router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);

module.exports = router;
