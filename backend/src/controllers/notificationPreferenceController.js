const { getCategories } = require('../models/eventModel');
const {
  getNotificationPreferences,
  updateNotificationPreferences,
  getInterestIds,
  replaceInterests,
} = require('../models/notificationPreferenceModel');

async function getPreferences(req, res) {
  try {
    const [preferences, interestIds] = await Promise.all([
      getNotificationPreferences(req.user.id),
      getInterestIds(req.user.id),
    ]);
    res.json({ preferences, interestIds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load notification preferences', details: err.message });
  }
}

async function updatePreferences(req, res) {
  try {
    const preferences = await updateNotificationPreferences(req.user.id, req.body || {});
    res.json({ preferences });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save notification preferences', details: err.message });
  }
}

async function updateInterests(req, res) {
  try {
    const categoryIds = req.body?.categoryIds;
    if (!Array.isArray(categoryIds) || categoryIds.some((id) => !Number.isInteger(Number(id)) || Number(id) < 1)) {
      return res.status(400).json({ error: 'categoryIds must be an array of positive integers' });
    }
    const categories = await getCategories();
    const allowed = new Set(categories.map((category) => category.id));
    const normalizedIds = [...new Set(categoryIds.map(Number))];
    if (normalizedIds.some((id) => !allowed.has(id))) {
      return res.status(400).json({ error: 'One or more interests are not available' });
    }
    const interestIds = await replaceInterests(req.user.id, normalizedIds);
    res.json({ interestIds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save interests', details: err.message });
  }
}

module.exports = { getPreferences, updatePreferences, updateInterests };