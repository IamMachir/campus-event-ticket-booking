# Campus Event Discovery & Ticket Booking Web App

A web application that helps university students discover campus events (club programs, seminars, cultural nights) and book tickets online. Organizers create and manage events; students browse, book seats, and receive digital tickets with QR codes for check-in at the venue. The system replaces manual, paper-based event announcements and ticketing with a centralized, easy-to-use web app.

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios
- Lucide React (icons)
- Recharts (analytics charts)

**Backend**
- Node.js + Express.js
- MySQL (via `mysql2`)
- JWT authentication (`jsonwebtoken`, `bcryptjs`)
- QR code generation (`qrcode`)

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
│   │   ├── utils/         # Email + ticket utilities
│   │   └── server.js      # App entry point
│   ├── migrations/        # SQL schema
│   ├── tests/             # Jest + Supertest test suite
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/            # Axios client
    │   ├── components/     # Shared UI components
    │   └── pages/          # Route-level pages
    └── index.html
```

---

## For New Users (Fresh Clone)

Follow these steps if you have never cloned this repository before.

### Prerequisites

- Node.js 18 or higher (download from https://nodejs.org)
- MySQL 8.0 or higher (download from https://dev.mysql.com/downloads)
- Git (download from https://git-scm.com)

### Step 1: Clone the repository

Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:

```bash
git clone https://github.com/IamMachir/campus-event-ticket-booking.git
cd campus-event-ticket-booking
```

### Step 2: Set up the database

Start MySQL, then run the migration files (this creates the database automatically):

```bash
cd backend
mysql -u root -p < migrations/001_init_schema.sql
mysql -u root -p < migrations/002_add_indexes.sql
mysql -u root -p < migrations/003_auth_profile_and_reset.sql
```

Enter your MySQL password when prompted. The migration creates the `campus_events` database and all tables for you.

> **Note:** Migrations also run automatically when the backend server starts, so you can skip this step if you prefer — just make sure your backend `.env` is configured first.

### Step 3: Configure the backend environment file

Copy the example environment file:

```bash
cp .env.example .env
```

Open the `.env` file in any text editor and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_events
JWT_SECRET=change_this_secret_in_production
```

### Step 4: Install backend dependencies and seed demo data

```bash
npm install
npm run seed
```

The seed script creates a demo admin, a demo organizer, a demo student, twenty sample events, and a couple of sample bookings. Demo login credentials are intentionally not stored in this README; `npm run seed` prints them to the terminal after a successful seed.

### Step 5: Start the backend server

```bash
npm run dev
```

The backend runs on `http://localhost:5000`. Keep this terminal open.

### Step 6: Install frontend dependencies and start it

Open a **new terminal window** (leave the backend terminal running):

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`. Open it in your browser.

### Step 7: Run tests (optional)

If you want to verify the backend is working correctly:

```bash
cd backend
npm test
```

This runs the test suite covering input validation, JWT auth middleware, ticket code generation, and booking controller logic.

---

## For Existing Users (Already Cloned — Need to Update)

Follow these steps if you already have a clone from before and want to pull the latest changes.

### Step 1: Pull the latest code

Open a terminal in your existing project folder:

```bash
cd campus-event-ticket-booking
git pull origin main
```

If you get a merge conflict, it usually means you have local changes. Stash them first:

```bash
git stash
git pull origin main
git stash pop
```

### Step 2: Install any new or updated dependencies

The dependency list may have changed. Reinstall both backend and frontend:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### Step 3: Check if the database schema changed

If any migration files were updated or added, re-run them:

```bash
cd backend
mysql -u root -p < migrations/001_init_schema.sql
mysql -u root -p < migrations/002_add_indexes.sql
mysql -u root -p < migrations/003_auth_profile_and_reset.sql
```

If you already have data in your tables and do not want to lose it, check the migration files first before running them. Only re-run if new columns or tables were added. Migrations also run automatically on server startup.

### Step 4: Re-seed demo data (optional)

If you want fresh demo data:

```bash
cd backend
npm run seed
```

### Step 5: Restart both servers

Stop the old backend and frontend processes (Ctrl+C in each terminal), then restart them:

**Terminal 1 (backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (frontend):**
```bash
cd frontend
npm run dev
```

### Step 6: Run tests (optional)

```bash
cd backend
npm test
```

---

## Core Features

- User registration & login (JWT-based)
- Event listing, detail, create/edit/delete (organizer-owned)
- Ticket booking with QR code generation
- QR ticket download as a PNG named after the event, plus separate ticket-code text download
- Booking cancellation with seat release
- Duplicate-booking prevention
- Organizer check-in via QR scanner (with manual code fallback)
- Role-based navigation (students do not see organizer-only pages)
- Route guards on authenticated pages
- Auto-redirect to login when session expires
- Server-side input validation on all write endpoints
- Responsive layout + loading states
- Seed script for demo data
- Organizer analytics dashboard (bookings per event, check-in rate) with a My Events view
- Dark theme UI with ASTU blue/green color scheme and glow effects

## How to Use

### As a Student
1. Open the app and browse events on the home page.
2. Log in with your student account.
3. Click an event to see details and book a seat.
4. View your bookings under "My Bookings" with your ticket code.
5. Download your QR ticket from the event detail page.
6. Cancel a booking if needed.

### As an Organizer
1. Log in with your organizer account.
2. Create a new event via "Create Event".
3. Go to "Scan Ticket" to check in attendees by QR code or manual entry.
4. View booking statistics on "Dashboard".

## License

This project was created for academic purposes as part of a course requirement at Adama Science and Technology University.


## Advanced attendee features

- QR ticket generation with downloadable ticket codes.
- Camera QR scanning with permission/error recovery, ticket validation, and atomic check-in protection.
- Saved event favorites for signed-in students.
- In-app notifications for booking confirmations.
- Attendee ratings for events after booking.
