# Campus Event Discovery & Ticket Booking Web App

A web application that helps university students discover campus events (club programs, seminars, cultural nights) and book tickets online. Organizers create and manage events; students browse, book seats, and receive digital tickets with QR codes for check-in at the venue. The system replaces manual, paper-based event announcements and ticketing with a centralized, easy-to-use web app.

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js + Express.js
- MySQL (via `mysql2`)
- JWT authentication (`jsonwebtoken`, `bcryptjs`)
- QR code generation (`qrcode`)

## Technical Concept Synthesis

This section maps the implementation to the Capstone Guide's Section 4 requirement of demonstrating advanced concepts from at least three domains.

**1. Security**
- Password storage uses bcrypt hashing with salting (never plaintext), mitigating OWASP A02 (Cryptographic Failures).
- JWT-based authentication with role-based access control (`requireAuth` / `requireRole` middleware) mitigates A01 (Broken Access Control) — organizer-only routes verify both a valid token and the correct role, and event edit/delete additionally verify the requester owns the event.
- Login returns an identical error message for "no such user" and "wrong password" to prevent user-enumeration attacks.
- `helmet` sets standard security headers; `express-rate-limit` throttles both general API traffic and (more strictly) auth endpoints specifically, mitigating A07 (Identification and Authentication Failures) via brute-force/credential-stuffing.
- Server-side input validation (`express-validator`) on every write endpoint mitigates A03 (Injection) at the application layer, in addition to parameterized queries via `mysql2`, which prevent SQL injection at the database layer.

**2. Software Quality (QA/Testing)**
- A Jest + Supertest suite (`backend/tests/`) covers input validation, JWT auth middleware (including role gating), ticket code generation, and booking business logic — specifically duplicate-booking prevention, capacity enforcement, and cancellation with seat release. Run with `npm test`.
- Tests use mocked models (`jest.mock`) rather than a live database, so the suite runs deterministically in any environment, including CI.

**3. Data & Algorithms**
- The schema (`migrations/001_init_schema.sql`) is normalized to avoid repeating groups and transitive dependencies: `categories` is factored out of `events` rather than storing a category name directly on each event row, and `bookings` references `events`/`users` by foreign key rather than duplicating event or user data.
- `migrations/002_add_indexes.sql` adds indexes on foreign keys (`organizer_id`, `category_id`, `event_id`, `user_id`) and the `start_time` sort column used by the event listing query. Without these, event listing (`ORDER BY start_time`) and per-organizer/per-user lookups degrade to full table scans — O(n) per request as the table grows. With the index, MySQL can use an index scan/seek instead of a filesort, keeping these queries close to O(log n + k) where k is the number of matching rows returned.

## Group Members

Computer Science and Engineering (CSE), 5th Year, Section 1

| ID | Name |
|---|---|
| UGE/27816/14 | Abenezer Tewodros |
| UGE/27834/14 | Efa Mirkana Abdisa |
| UGE/27638/14 | Machir Tadesse Woldemariam |
| UGE/27831/14 | Musbha Rida |
| UGE/27830/14 | Samii Girmaa |
| UGE/27827/14 | Seid Jemal |

**Database**
- MySQL — see `backend/migrations/001_init_schema.sql`

## Project Structure

```
campus-event-ticket-booking/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # Route handler logic
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # DB queries
│   │   ├── routes/        # Express routers
│   │   └── server.js      # App entry point
│   ├── migrations/        # SQL schema
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/            # Axios client
    │   ├── components/     # Shared UI components
    │   └── pages/          # Route-level pages
    └── index.html
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # fill in your MySQL credentials
npm install
mysql -u root -p < migrations/001_init_schema.sql
npm run dev
```

### Seed demo data (optional but recommended for demos)

```bash
cd backend
npm run seed
```

This creates a demo organizer (`organizer@demo.campus.edu` / `demo1234`), a demo student (`student@demo.campus.edu` / `demo1234`), three sample events across different categories, and a couple of sample bookings — so the app isn't empty the first time you open it. Safe to re-run.

### Run tests

```bash
cd backend
npm test
```

Covers input validation rules, JWT auth middleware, ticket code generation, and booking controller logic (duplicate-booking prevention, capacity checks, cancellation) using Jest with mocked models — no database connection required to run the suite.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:5000/api` (configurable via `VITE_API_URL`).

## Deployment

- **Backend**: `render.yaml` is included for one-click deployment on [Render](https://render.com) — connect the repo, Render reads the blueprint, and you'll be prompted for your MySQL credentials as environment variables (marked `sync: false`). Railway works similarly if you prefer it.
- **Database**: A managed MySQL instance on Railway, PlanetScale, or Render's own MySQL add-on. Run the migration (`migrations/001_init_schema.sql`) once against it, then optionally `npm run seed`.
- **Frontend**: Deploy the `frontend/` folder to Vercel or Netlify. Set `VITE_API_URL` to your deployed backend's `/api` URL, and make sure the backend's CORS config allows your frontend's domain.

## Demo Script (for your defense)

1. Open the app as a guest — browse the seeded events on the home page.
2. Log in as the demo student (`student@demo.campus.edu` / `demo1234`) and show an existing booking with its QR ticket under "My Bookings".
3. Log in as the demo organizer (`organizer@demo.campus.edu` / `demo1234`) and create a new event via "Create Event".
4. Book a seat as the student on the new event, showing the seat counter decrease and the QR code generated.
5. Go to "Check-In" as the organizer and scan (or manually enter) the ticket code to demonstrate check-in.
6. Cancel a booking from "My Bookings" to show the seat being released back.

## Core Features

- [x] User registration & login (JWT-based)
- [x] Event listing, detail, create/edit/delete (organizer-owned)
- [x] Ticket booking with QR code generation
- [x] Booking cancellation with seat release
- [x] Duplicate-booking prevention
- [x] Organizer check-in via QR scanner (with manual code fallback)
- [x] Route guards on authenticated pages
- [x] Server-side input validation on all write endpoints
- [x] Responsive layout + loading states
- [x] Seed script for demo data
- [ ] Email notifications on booking
- [ ] Organizer analytics dashboard (bookings per event, check-in rate)

## Status

Feature-complete for a capstone MVP: schema, auth, full event/booking lifecycle, QR check-in, validation, and responsive UI are all in place, with seed data and a deployment blueprint ready for hosting. Analytics and notifications are noted as future work.

