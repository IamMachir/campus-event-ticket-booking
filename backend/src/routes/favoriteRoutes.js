const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listFavorites, saveFavorite, deleteFavorite } = require('../controllers/favoriteController');
router.use(requireAuth);
router.get('/me', listFavorites);
router.post('/:eventId', saveFavorite);
router.delete('/:eventId', deleteFavorite);
module.exports = router;
