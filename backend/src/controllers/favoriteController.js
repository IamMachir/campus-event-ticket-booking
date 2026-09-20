const { getFavoriteEventIds, addFavorite, removeFavorite } = require('../models/favoriteModel');
const { getEventById } = require('../models/eventModel');
async function listFavorites(req, res) { try { res.json(await getFavoriteEventIds(req.user.id)); } catch (err) { res.status(500).json({ error: 'Failed to load favorites', details: err.message }); } }
async function saveFavorite(req, res) { try { const event = await getEventById(req.params.eventId); if (!event) return res.status(404).json({ error: 'Event not found' }); await addFavorite(req.user.id, event.id); res.status(201).json({ eventId: event.id, favorited: true }); } catch (err) { res.status(500).json({ error: 'Failed to save favorite', details: err.message }); } }
async function deleteFavorite(req, res) { try { await removeFavorite(req.user.id, req.params.eventId); res.json({ eventId: Number(req.params.eventId), favorited: false }); } catch (err) { res.status(500).json({ error: 'Failed to remove favorite', details: err.message }); } }
module.exports = { listFavorites, saveFavorite, deleteFavorite };
