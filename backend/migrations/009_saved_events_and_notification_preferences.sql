-- Saved event indexes, notification delivery metadata, and student preferences.
USE campus_events;

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id INT NOT NULL PRIMARY KEY,
  approaching_enabled TINYINT(1) NOT NULL DEFAULT 1,
  date_change_enabled TINYINT(1) NOT NULL DEFAULT 1,
  location_change_enabled TINYINT(1) NOT NULL DEFAULT 1,
  interest_match_enabled TINYINT(1) NOT NULL DEFAULT 1,
  email_enabled TINYINT(1) NOT NULL DEFAULT 0,
  push_enabled TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_interests (
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, category_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'favorites'
   AND index_name = 'idx_favorites_event_id') = 0,
  'CREATE INDEX idx_favorites_event_id ON favorites(event_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_read_at = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'read_at'
);
SET @sql = IF(@has_read_at = 0,
  'ALTER TABLE notifications ADD COLUMN read_at DATETIME NULL AFTER is_read',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_delivery_status = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'delivery_status'
);
SET @sql = IF(@has_delivery_status = 0,
  'ALTER TABLE notifications ADD COLUMN delivery_status VARCHAR(20) NOT NULL DEFAULT ''pending'' AFTER read_at',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_notification_key = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = 'notification_key'
);
SET @sql = IF(@has_notification_key = 0,
  'ALTER TABLE notifications ADD COLUMN notification_key VARCHAR(255) NULL AFTER delivery_status',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'notifications'
   AND index_name = 'uq_notifications_key') = 0,
  'CREATE UNIQUE INDEX uq_notifications_key ON notifications(notification_key)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;