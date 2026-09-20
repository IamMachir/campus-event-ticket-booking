-- Adds server-enforced visibility state and an index for discovery views.
USE campus_events;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE() AND table_name = 'events'
   AND column_name = 'status') = 0,
  'ALTER TABLE events ADD COLUMN status ENUM(''DRAFT'', ''PUBLISHED'', ''CANCELLED'') NOT NULL DEFAULT ''PUBLISHED'' AFTER organizer_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'events'
   AND index_name = 'idx_events_status_start_time') = 0,
  'CREATE INDEX idx_events_status_start_time ON events(status, start_time)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;