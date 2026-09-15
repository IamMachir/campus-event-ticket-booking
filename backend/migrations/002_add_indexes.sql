-- Adds indexes on foreign keys and frequently-queried/sorted columns.
-- Uses guarded prepared statements so the application migration runner can
-- execute this file one statement at a time. MySQL's DELIMITER command is a
-- mysql-client directive, not SQL, and stored procedures therefore cannot be
-- safely split and sent through mysql2.
USE campus_events;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'events'
   AND index_name = 'idx_events_organizer_id') = 0,
  'CREATE INDEX idx_events_organizer_id ON events(organizer_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'events'
   AND index_name = 'idx_events_category_id') = 0,
  'CREATE INDEX idx_events_category_id ON events(category_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'events'
   AND index_name = 'idx_events_start_time') = 0,
  'CREATE INDEX idx_events_start_time ON events(start_time)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'bookings'
   AND index_name = 'idx_bookings_event_id') = 0,
  'CREATE INDEX idx_bookings_event_id ON bookings(event_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'bookings'
   AND index_name = 'idx_bookings_user_id') = 0,
  'CREATE INDEX idx_bookings_user_id ON bookings(user_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
