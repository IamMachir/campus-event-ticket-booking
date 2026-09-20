const { getNotifications, markNotificationRead, markAllNotificationsRead } = require('../models/notificationModel');
async function listNotifications(req, res) { try { res.json(await getNotifications(req.user.id)); } catch (err) { res.status(500).json({ error: 'Failed to load notifications', details: err.message }); } }
async function readNotification(req, res) { try { await markNotificationRead(req.params.id, req.user.id); res.json({ message: 'Notification marked as read' }); } catch (err) { res.status(500).json({ error: 'Failed to update notification', details: err.message }); } }
async function readAllNotifications(req, res) { try { await markAllNotificationsRead(req.user.id); res.json({ message: 'Notifications marked as read' }); } catch (err) { res.status(500).json({ error: 'Failed to update notifications', details: err.message }); } }
module.exports = { listNotifications, readNotification, readAllNotifications };
