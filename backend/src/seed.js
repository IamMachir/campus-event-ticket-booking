/**
 * Seeds the database with realistic demo data so the app isn't empty on
 * first run — a demo organizer + student, a few categories, upcoming
 * events, and a couple of sample bookings with generated ticket codes.
 *
 * Run with: node src/seed.js
 * Safe to re-run: it checks for existing seed users by email before inserting.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const { generateTicketCode } = require('./utils/ticket');

async function upsertUser({ fullName, email, password, role }) {
  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) return existing[0].id;

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [fullName, email, passwordHash, role]
  );
  return result.insertId;
}

async function upsertCategory(name) {
  const [existing] = await db.query('SELECT id FROM categories WHERE name = ?', [name]);
  if (existing.length > 0) return existing[0].id;

  const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return result.insertId;
}

async function insertEventIfMissing({ title, description, categoryId, organizerId, location, startTime, endTime, capacity }) {
  const [existing] = await db.query('SELECT id FROM events WHERE title = ?', [title]);
  if (existing.length > 0) return existing[0].id;

  const [result] = await db.query(
    `INSERT INTO events (title, description, category_id, organizer_id, location, start_time, end_time, capacity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, categoryId, organizerId, location, startTime, endTime, capacity]
  );
  return result.insertId;
}

async function insertBookingIfMissing({ eventId, userId }) {
  const [existing] = await db.query(
    'SELECT id FROM bookings WHERE event_id = ? AND user_id = ?',
    [eventId, userId]
  );
  if (existing.length > 0) return;

  const ticketCode = generateTicketCode();
  await db.query('INSERT INTO bookings (event_id, user_id, ticket_code) VALUES (?, ?, ?)', [
    eventId,
    userId,
    ticketCode,
  ]);
  await db.query('UPDATE events SET seats_booked = seats_booked + 1 WHERE id = ?', [eventId]);
}

function daysFromNow(days, hour = 17) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

async function seed() {
  console.log('Seeding demo data...');

  const organizerId = await upsertUser({
    fullName: 'Demo Organizer',
    email: 'organizer@demo.campus.edu',
    password: 'demo1234',
    role: 'organizer',
  });

  const studentId = await upsertUser({
    fullName: 'Demo Student',
    email: 'student@demo.campus.edu',
    password: 'demo1234',
    role: 'student',
  });

  const musicCategoryId = await upsertCategory('Music & Culture');
  const techCategoryId = await upsertCategory('Tech & Career');
  const sportsCategoryId = await upsertCategory('Sports & Wellness');

  const event1 = await insertEventIfMissing({
    title: 'Campus Cultural Night',
    description: 'An evening of music, dance, and food celebrating campus diversity.',
    categoryId: musicCategoryId,
    organizerId,
    location: 'Main Auditorium',
    startTime: daysFromNow(3, 18),
    endTime: daysFromNow(3, 21),
    capacity: 150,
  });

  const event2 = await insertEventIfMissing({
    title: 'Tech Career Fair',
    description: 'Meet recruiters from local tech companies and startups.',
    categoryId: techCategoryId,
    organizerId,
    location: 'Engineering Building Hall',
    startTime: daysFromNow(7, 10),
    endTime: daysFromNow(7, 16),
    capacity: 200,
  });

  const event3 = await insertEventIfMissing({
    title: 'Inter-department Football Tournament',
    description: 'Cheer on your department in the annual football tournament final.',
    categoryId: sportsCategoryId,
    organizerId,
    location: 'Campus Sports Field',
    startTime: daysFromNow(10, 15),
    endTime: daysFromNow(10, 18),
    capacity: 300,
  });

  await insertBookingIfMissing({ eventId: event1, userId: studentId });
  await insertBookingIfMissing({ eventId: event2, userId: studentId });

  console.log('Seed complete.');
  console.log('Demo organizer login: organizer@demo.campus.edu / demo1234');
  console.log('Demo student login:   student@demo.campus.edu / demo1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
