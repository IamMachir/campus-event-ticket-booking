-- Adds indexes on foreign keys and frequently-queried/sorted columns.
-- Uses a procedure so re-running won't fail if indexes already exist.
USE campus_events;

DELIMITER //

DROP PROCEDURE IF EXISTS add_indexes_if_missing //
CREATE PROCEDURE add_indexes_if_missing()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = 'campus_events' AND table_name = 'events' AND index_name = 'idx_events_organizer_id') THEN
    CREATE INDEX idx_events_organizer_id ON events(organizer_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = 'campus_events' AND table_name = 'events' AND index_name = 'idx_events_category_id') THEN
    CREATE INDEX idx_events_category_id ON events(category_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = 'campus_events' AND table_name = 'events' AND index_name = 'idx_events_start_time') THEN
    CREATE INDEX idx_events_start_time ON events(start_time);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = 'campus_events' AND table_name = 'bookings' AND index_name = 'idx_bookings_event_id') THEN
    CREATE INDEX idx_bookings_event_id ON bookings(event_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.statistics WHERE table_schema = 'campus_events' AND table_name = 'bookings' AND index_name = 'idx_bookings_user_id') THEN
    CREATE INDEX idx_bookings_user_id ON bookings(user_id);
  END IF;
END //

DELIMITER ;

CALL add_indexes_if_missing();
DROP PROCEDURE IF EXISTS add_indexes_if_missing;
