const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getOrganizerStats,
} = require('../models/eventModel');

async function listEvents(req, res) {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
}

async function getEvent(req, res) {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event', details: err.message });
  }
}

async function addEvent(req, res) {
  try {
    const { title, description, categoryId, location, startTime, endTime, capacity } = req.body;
    if (!title || !startTime || !capacity) {
      return res.status(400).json({ error: 'title, startTime and capacity are required' });
    }

    const eventId = await createEvent({
      title,
      description,
      categoryId,
      organizerId: req.user.id,
      location,
      startTime,
      endTime,
      capacity,
    });

    res.status(201).json({ id: eventId, title });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
}

async function editEvent(req, res) {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const isOwner = event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only the organizer who created this event (or an admin) can edit it' });
    }

    const { title, description, categoryId, location, startTime, endTime, capacity } = req.body;
    if (!title || !startTime || !capacity) {
      return res.status(400).json({ error: 'title, startTime and capacity are required' });
    }

    await updateEvent(req.params.id, { title, description, categoryId, location, startTime, endTime, capacity });
    res.json({ id: Number(req.params.id), title });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event', details: err.message });
  }
}

async function removeEvent(req, res) {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const isOwner = event.organizer_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only the organizer who created this event (or an admin) can delete it' });
    }

    await deleteEvent(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event', details: err.message });
  }
}

async function organizerStats(req, res) {
  try {
    const stats = await getOrganizerStats(req.user.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organizer stats', details: err.message });
  }
}

module.exports = { listEvents, getEvent, addEvent, editEvent, removeEvent, organizerStats };
