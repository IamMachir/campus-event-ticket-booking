-- Auth & profile management additions
-- Run with: mysql -u root -p < migrations/003_auth_profile_and_reset.sql

USE campus_events;

-- Adds profile photo support and an updated_at audit column to users.
-- MySQL: IF NOT EXISTS is not supported for ADD COLUMN, so the guard is
-- written via INFORMATION_SCHEMA + prepared statement to stay re-runnable.
SET @has_profile_image = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'profile_image'
);
SET @sql = IF(@has_profile_image = 0,
  'ALTER TABLE users ADD COLUMN profile_image VARCHAR(500) NULL AFTER role',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @has_updated_at = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'updated_at'
);
SET @sql = IF(@has_updated_at = 0,
  'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Dedicated password reset storage, kept separate from the user record.
-- Only the sha256 hash of the token is stored; tokens expire and are
-- invalidated after use (used_at IS NULL means still valid).
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
