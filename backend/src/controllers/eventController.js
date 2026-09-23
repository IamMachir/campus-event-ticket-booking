const {
  createEvent,
  getCategories,
  getCategoryById,
  searchEvents,
  getEventsByOrganizer,
  getEventById,
  updateEvent,
  deleteEvent,
  getOrganizerStats,
} = require('../models/eventModel');
const { EVENT_CATEGORIES } = require('../constants/eventCategories');
const { DISCOVERY_VIEWS } = require('../constants/discoveryViews');
const { createNotification } = require('../models/notificationModel');
const { getEventAudience } = require('../models/eventNotificationModel');
const { getUsersInterestedInCategory } = require('../models/notificationPreferenceModel');

function comparableDate(value) {
  if (value === null || value === undefined || value === '') return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : String(parsed.getTime());
}

function eventValueChanged(before, after) {
  return comparableDate(before) !== comparableDate(after);
}

async function notifyEventAudience(event, {
  type,
  title,
  message,
  preference,
  notificationKey,
}) {
  const userIds = await getEventAudience(event.id);
  await Promise.all(userIds.map((userId) => createNotification({
    userId,
    type,
    title,
    message,
    eventId: event.id,
    preference,
    notificationKey: `${notificationKey}:user:${userId}`,
  })));
}

async function notifyInterestMatches(event) {
  if (!event.category_id || event.status !== 'PUBLISHED') return;
  const userIds = await getUsersInterestedInCategory(event.category_id);
  await Promise.all(userIds.map((userId) => createNotification({
    userId,
    type: 'interest_match',
    title: 'New event matches your interests',
    message: `"${event.title}" was just published in ${event.category_name || 'one of your selected categories'}.`,
    eventId: event.id,
    preference: 'interest_match_enabled',
    notificationKey: `event:${event.id}:interest-match:user:${userId}`,
  })));
}

async function listEvents(req, res) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const view = typeof req.query.view === 'string' ? req.query.view.trim().toLowerCase() : 'all';
    const page = Number.parseInt(req.query.page || '1', 10);
    const limit = Number.parseInt(req.query.limit || '12', 10);

    if (req.query.search !== undefined && typeof req.query.search !== 'string') {
      return res.status(400).json({ error: 'search must be a single text value' });
    }
    if (search.length > 100) {
      return res.status(400).json({ error: 'search must be 100 characters or fewer' });
    }
    if (!DISCOVERY_VIEWS.includes(view)) {
      return res.status(400).json({ error: 'Invalid event discovery view' });
    }
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      return res.status(400).json({ error: 'page and limit must be positive integers' });
    }

    let categoryId = null;
    if (category && category.toLowerCase() !== 'all categories' && category.toLowerCase() !== 'all') {
      if (!EVENT_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: 'Invalid event category' });
      }
      const categoryRecord = await getCategoryByIdOrName(category);
      if (!categoryRecord) {
        return res.status(400).json({ error: 'Event category is not available' });
      }
      categoryId = categoryRecord.id;
    }

    const result = await searchEvents({
      search,
      categoryId,
      view,
      page,
      limit: Math.min(limit, 50),
    });

    res.json({
      events: result.events,
      pagination: {
        page,
        limit: Math.min(limit, 50),
        total: result.total,
        totalPages: Math.ceil(result.total / Math.min(limit, 50)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

async function getCategoryByIdOrName(name) {
  const categories = await getCategories();
  return categories.find((category) => category.name === name) || null;
}

async function listCategories(req, res) {
  try {
    res.json(await getCategories());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event categories' });
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

async function listOrganizerEvents(req, res) {
  try {
    const events = await getEventsByOrganizer(req.user.id);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your events', details: err.message });
  }
}

async function addEvent(req, res) {
  try {
    const { title, description, categoryId, location, startTime, endTime, capacity } = req.body;
    if (!title || !startTime || !capacity) {
      return res.status(400).json({ error: 'title, startTime and capacity are required' });
    }
    if (!(await getCategoryById(categoryId))) {
      return res.status(400).json({ error: 'A valid event category is required' });
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

    const event = await getEventById(eventId);
    try {
      await notifyInterestMatches(event);
    } catch (notificationError) {
      console.error('Interest-match notifications failed:', notificationError.message);
    }
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
    if (!(await getCategoryById(categoryId))) {
      return res.status(400).json({ error: 'A valid event category is required' });
    }

    const dateChanged = eventValueChanged(event.start_time, startTime)
      || eventValueChanged(event.end_time, endTime);
    const locationChanged = (event.location || '') !== (location || '');
    await updateEvent(req.params.id, { title, description, categoryId, location, startTime, endTime, capacity });
    const updatedEvent = await getEventById(req.params.id);
    try {
      if (dateChanged) {
        await notifyEventAudience(updatedEvent, {
          type: 'event_date_changed',
          title: 'Event date changed',
          message: `The date or time for "${updatedEvent.title}" has changed. Check the updated event schedule.`,
          preference: 'date_change_enabled',
          notificationKey: `event:${updatedEvent.id}:date:${comparableDate(updatedEvent.start_time)}:${comparableDate(updatedEvent.end_time)}`,
        });
      }
      if (locationChanged) {
        await notifyEventAudience(updatedEvent, {
          type: 'event_location_changed',
          title: 'Event location changed',
          message: `The location for "${updatedEvent.title}" is now ${updatedEvent.location || 'to be announced'}.`,
          preference: 'location_change_enabled',
          notificationKey: `event:${updatedEvent.id}:location:${updatedEvent.location || 'tba'}`,
        });
      }
    } catch (notificationError) {
      console.error('Event-change notifications failed:', notificationError.message);
    }
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

module.exports = {
  listEvents,
  listCategories,
  listOrganizerEvents,
  getEvent,
  addEvent,
  editEvent,
  removeEvent,
  organizerStats,
};
