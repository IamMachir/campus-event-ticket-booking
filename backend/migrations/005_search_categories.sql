-- Align existing category data with the controlled event category catalogue
-- and add indexes used by the event search query.
USE campus_events;

INSERT IGNORE INTO categories (name) VALUES
  ('Technology'),
  ('Music'),
  ('Sports'),
  ('Education'),
  ('Business'),
  ('Entertainment'),
  ('Clubs'),
  ('Workshops');

UPDATE events e
JOIN categories old_category ON e.category_id = old_category.id
JOIN categories target_category ON target_category.name = 'Education'
SET e.category_id = target_category.id
WHERE old_category.name = 'Academic & Tech';

UPDATE events e
JOIN categories old_category ON e.category_id = old_category.id
JOIN categories target_category ON target_category.name = 'Business'
SET e.category_id = target_category.id
WHERE old_category.name = 'Career & Professional Development';

UPDATE events e
JOIN categories old_category ON e.category_id = old_category.id
JOIN categories target_category ON target_category.name = 'Entertainment'
SET e.category_id = target_category.id
WHERE old_category.name = 'Student Life & Entertainment';

UPDATE events e
JOIN categories old_category ON e.category_id = old_category.id
JOIN categories target_category ON target_category.name = 'Sports'
SET e.category_id = target_category.id
WHERE old_category.name = 'Sports & Recreation';

UPDATE events e
JOIN categories old_category ON e.category_id = old_category.id
JOIN categories target_category ON target_category.name = 'Technology'
SET e.category_id = target_category.id
WHERE old_category.name = 'Innovation & Coding';

UPDATE events e
JOIN categories old_category ON e.category_id = old_category.id
JOIN categories target_category ON target_category.name = 'Clubs'
SET e.category_id = target_category.id
WHERE old_category.name = 'Health & Community Service';

DELETE FROM categories
WHERE name IN (
  'Academic & Tech',
  'Career & Professional Development',
  'Student Life & Entertainment',
  'Sports & Recreation',
  'Innovation & Coding',
  'Health & Community Service'
);

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'events'
   AND index_name = 'idx_events_title') = 0,
  'CREATE INDEX idx_events_title ON events(title)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'events'
   AND index_name = 'idx_events_location') = 0,
  'CREATE INDEX idx_events_location ON events(location)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;