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

