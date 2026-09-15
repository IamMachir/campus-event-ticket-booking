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

  const adminId = await upsertUser({
    fullName: 'Admin User',
    email: 'admin@demo.campus.edu',
    password: 'admin1234',
    role: 'admin',
  });

  const academicTechCategoryId = await upsertCategory('Academic & Tech');
  const careerCategoryId = await upsertCategory('Career & Professional Development');
  const studentLifeCategoryId = await upsertCategory('Student Life & Entertainment');
  const sportsCategoryId = await upsertCategory('Sports & Recreation');
  const innovationCategoryId = await upsertCategory('Innovation & Coding');
  const healthCategoryId = await upsertCategory('Health & Community Service');

  const event1 = await insertEventIfMissing({
    title: 'ASTU Annual Innovation & Robotics Expo',
    description:
      'Discover the groundbreaking projects built by your fellow ASTU peers. Watch live engineering demonstrations, experience student-designed robotics competitions, and network with local tech recruiters looking for interns.',
    categoryId: academicTechCategoryId,
    organizerId,
    location: 'ASTU Main Gymnasium',
    startTime: '2026-10-22 09:00:00',
    endTime: '2026-10-23 17:00:00',
    capacity: 250,
  });

  const event2 = await insertEventIfMissing({
    title: 'STEM Career Fair & Networking Day',
    description:
      'Connect directly with top engineering, computing, and industrial companies from across Ethiopia. Bring copies of your CV, meet HR representatives, and attend brief breakout sessions on interviewing tips.',
    categoryId: careerCategoryId,
    organizerId,
    location: 'Block 50 Auditorium',
    startTime: '2026-11-04 10:00:00',
    endTime: '2026-11-04 16:30:00',
    capacity: 200,
  });

  const event3 = await insertEventIfMissing({
    title: 'Freshman Welcome Night & Talent Showcase',
    description:
      'Welcome to the ASTU family! Join us for a fun night of live student music, traditional cultural dances, comedy sketches, and a great opportunity to meet new friends across different departments.',
    categoryId: studentLifeCategoryId,
    organizerId,
    location: 'The Open-Air Amphitheater',
    startTime: '2026-10-16 18:00:00',
    endTime: '2026-10-16 21:30:00',
    capacity: 300,
  });

  const event4 = await insertEventIfMissing({
    title: 'Inter-Departmental Football Championship',
    description:
      "Come out and cheer for your department! The School of Electrical Engineering faces off against the School of Civil Engineering in this year's highly anticipated campus finals. Refreshments will be available.",
    categoryId: sportsCategoryId,
    organizerId,
    location: 'ASTU Campus Sports Stadium',
    startTime: '2026-11-14 15:30:00',
    endTime: '2026-11-14 18:00:00',
    capacity: 400,
  });

  const event5 = await insertEventIfMissing({
    title: 'ASTU 24-Hour CodeSprint Hackathon',
    description:
      'Form a team of up to four students and solve real-world campus problems using software. Cash prizes, certificates, and cloud hosting credits will be awarded to the top three innovative solutions.',
    categoryId: innovationCategoryId,
    organizerId,
    location: 'ICT Center, Lab 3',
    startTime: '2026-12-04 14:00:00',
    endTime: '2026-12-05 14:00:00',
    capacity: 120,
  });

  const event6 = await insertEventIfMissing({
    title: 'Campus Red Cross Blood Donation Drive',
    description:
      'Give blood and save a life. Join the ASTU Red Cross Club for our semesterly donation campaign. All student and staff donors will receive complimentary juice, biscuits, and a participation badge.',
    categoryId: healthCategoryId,
    organizerId,
    location: 'Student Clinic Lounge',
    startTime: '2026-11-18 08:30:00',
    endTime: '2026-11-18 16:00:00',
    capacity: 100,
  });

  // Keep the six ASTU-specific events above and add fourteen more realistic
  // campus events so a fresh seed contains a full twenty-event catalogue.
  const additionalEvents = [
    {
      title: 'Student Research Symposium',
      description: 'Student researchers present practical projects, posters, and findings from across ASTU departments.',
      categoryId: academicTechCategoryId,
      location: 'Science Complex Hall',
      startTime: '2026-10-20 09:00:00',
      endTime: '2026-10-20 15:00:00',
      capacity: 180,
    },
    {
      title: 'Mathematics Problem-Solving Workshop',
      description: 'A hands-on workshop for students who want to sharpen their mathematical reasoning and competition skills.',
      categoryId: academicTechCategoryId,
      location: 'Block 12 Seminar Room',
      startTime: '2026-10-27 14:00:00',
      endTime: '2026-10-27 17:00:00',
      capacity: 80,
    },
    {
      title: 'Women in Technology Panel',
      description: 'Meet inspiring women working in technology, engineering, research, and entrepreneurship.',
      categoryId: careerCategoryId,
      location: 'Innovation Hub Auditorium',
      startTime: '2026-11-06 13:00:00',
      endTime: '2026-11-06 16:00:00',
      capacity: 220,
    },
    {
      title: 'CV Clinic and Mock Interview Day',
      description: 'Bring your CV and practise interviews with volunteer professionals and final-year mentors.',
      categoryId: careerCategoryId,
      location: 'Career Development Center',
      startTime: '2026-11-10 09:00:00',
      endTime: '2026-11-10 17:00:00',
      capacity: 120,
    },
    {
      title: 'International Food and Culture Festival',
      description: 'Celebrate the cultures represented on campus through food, music, stories, and student performances.',
      categoryId: studentLifeCategoryId,
      location: 'Central Student Square',
      startTime: '2026-11-21 11:00:00',
      endTime: '2026-11-21 19:00:00',
      capacity: 600,
    },
    {
      title: 'Acoustic Evening Under the Stars',
      description: 'An intimate evening of student musicians, spoken word, and relaxed campus community time.',
      categoryId: studentLifeCategoryId,
      location: 'Open-Air Amphitheater',
      startTime: '2026-11-27 18:30:00',
      endTime: '2026-11-27 21:30:00',
      capacity: 350,
    },
    {
      title: 'ASTU Basketball 3x3 Tournament',
      description: 'Teams from across campus compete in a fast-paced 3x3 basketball tournament.',
      categoryId: sportsCategoryId,
      location: 'ASTU Outdoor Courts',
      startTime: '2026-12-01 10:00:00',
      endTime: '2026-12-01 17:00:00',
      capacity: 250,
    },
    {
      title: 'Campus Fun Run for Education',
      description: 'Run or walk together to support student learning initiatives and campus wellness.',
      categoryId: sportsCategoryId,
      location: 'Main Gate to Sports Stadium',
      startTime: '2026-12-12 07:00:00',
      endTime: '2026-12-12 11:00:00',
      capacity: 500,
    },
    {
      title: 'Open Source Contribution Lab',
      description: 'Learn how to find beginner-friendly issues, collaborate online, and make your first open-source contribution.',
      categoryId: innovationCategoryId,
      location: 'ICT Center, Lab 1',
      startTime: '2026-12-15 14:00:00',
      endTime: '2026-12-15 18:00:00',
      capacity: 100,
    },
    {
      title: 'AI and Responsible Innovation Forum',
      description: 'Discuss practical artificial intelligence, ethics, and the responsibilities of tomorrow’s builders.',
      categoryId: innovationCategoryId,
      location: 'Engineering Lecture Theater',
      startTime: '2027-01-08 09:00:00',
      endTime: '2027-01-08 13:00:00',
      capacity: 240,
    },
    {
      title: 'Mental Wellness and Study Balance Session',
      description: 'Practical strategies for managing academic pressure, sleep, focus, and healthy routines.',
      categoryId: healthCategoryId,
      location: 'Student Wellness Center',
      startTime: '2027-01-13 15:00:00',
      endTime: '2027-01-13 17:00:00',
      capacity: 100,
    },
    {
      title: 'Campus Clean-Up and Tree Planting',
      description: 'Work with student clubs to improve shared spaces and plant trees around the campus.',
      categoryId: healthCategoryId,
      location: 'ASTU East Courtyard',
      startTime: '2027-01-16 08:00:00',
      endTime: '2027-01-16 12:00:00',
      capacity: 180,
    },
    {
      title: 'Entrepreneurship Pitch Night',
      description: 'Student founders pitch ideas to a friendly panel and receive feedback, connections, and prizes.',
      categoryId: careerCategoryId,
      location: 'Business and Innovation Center',
      startTime: '2027-01-22 17:00:00',
      endTime: '2027-01-22 20:00:00',
      capacity: 200,
    },
    {
      title: 'Interfaculty Debate Championship',
      description: 'Watch the strongest student debaters make the case on current issues in a lively final round.',
      categoryId: studentLifeCategoryId,
      location: 'Main University Hall',
      startTime: '2027-01-29 14:00:00',
      endTime: '2027-01-29 18:00:00',
      capacity: 300,
    },
  ];

  for (const event of additionalEvents) {
    await insertEventIfMissing({ ...event, organizerId });
  }

  await insertBookingIfMissing({ eventId: event1, userId: studentId });
  await insertBookingIfMissing({ eventId: event3, userId: studentId });

  console.log('Seed complete.');
  console.log('Demo credentials (printed here instead of stored in the README):');
  console.log('Demo admin login:      admin@demo.campus.edu / admin1234');
  console.log('Demo organizer login:  organizer@demo.campus.edu / demo1234');
  console.log('Demo student login:    student@demo.campus.edu / demo1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
