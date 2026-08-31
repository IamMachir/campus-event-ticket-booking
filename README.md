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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:5000/api` (configurable via `VITE_API_URL`).

## Core Features (in progress)

- [x] User registration & login (JWT-based)
- [x] Event listing
- [x] Ticket booking with QR code generation
- [x] Organizer check-in endpoint
- [ ] Organizer event creation UI
- [ ] QR scanner check-in UI
- [ ] Booking capacity edge cases & notifications

## Status

Foundational scaffold: database schema, authentication, core API routes, and base frontend pages are in place. Feature work is ongoing.
