-- Adds indexes on foreign keys and frequently-queried/sorted columns.
-- Without these, MySQL falls back to full table scans for lookups like
-- "all events by this organizer" or "all bookings for this user", and to
-- a filesort for the event listing's ORDER BY start_time. At capstone
-- scale this is invisible, but it's the correct engineering practice and
-- is what keeps event listing close to O(log n + k) (index seek + k
-- matching rows) instead of O(n) per request as the events table grows.

CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_start_time ON events(start_time);

CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
-- Note: bookings.ticket_code and users.email already have UNIQUE constraints,
-- which MySQL indexes automatically — no separate index needed for those.
