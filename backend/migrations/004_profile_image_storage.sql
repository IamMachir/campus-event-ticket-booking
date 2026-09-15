-- Permit locally uploaded profile images stored as small data URLs.
USE campus_events;

ALTER TABLE users MODIFY COLUMN profile_image TEXT NULL;