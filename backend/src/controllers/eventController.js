const { createEvent, getAllEvents, getEventById } = require('../models/eventModel');

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

module.exports = { listEvents, getEvent, addEvent };
