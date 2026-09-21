-- Add 'expired' status to bookings ENUM so past-day tickets are marked expired.
-- Existing rows keep their current status; the new value is appended to the ENUM.
USE campus_events;

ALTER TABLE bookings
  MODIFY COLUMN status ENUM('booked', 'checked_in', 'cancelled', 'expired') NOT NULL DEFAULT 'booked';
