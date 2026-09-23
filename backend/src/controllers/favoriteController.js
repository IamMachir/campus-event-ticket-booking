const { getFavoriteEventIds, getFavoriteEvents, addFavorite, removeFavorite } = require('../models/favoriteModel');
const { getEventById } = require('../models/eventModel');
async function listFavorites(req, res) { try { res.json(await getFavoriteEventIds(req.user.id)); } catch (err) { res.status(500).json({ error: 'Failed to load favorites', details: err.message }); } }
async function listFavoriteEvents(req, res) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search.length > 100) return res.status(400).json({ error: 'search must be 100 characters or fewer' });
    res.json(await getFavoriteEvents(req.user.id, search));
  } catch (err) {
    res.status(500).json({ error: 'Failed to load saved events', details: err.message });
  }
}
async function saveFavorite(req, res) {
  try {
    const event = await getEventById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.status !== 'PUBLISHED') return res.status(400).json({ error: 'This event is not available to save' });
    await addFavorite(req.user.id, event.id);
    res.status(201).json({ eventId: event.id, favorited: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save favorite', details: err.message });
  }
}
async function deleteFavorite(req, res) { try { await removeFavorite(req.user.id, req.params.eventId); res.json({ eventId: Number(req.params.eventId), favorited: false }); } catch (err) { res.status(500).json({ error: 'Failed to remove favorite', details: err.message }); } }
module.exports = { listFavorites, listFavoriteEvents, saveFavorite, deleteFavorite };
