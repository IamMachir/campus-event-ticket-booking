# Campus Event Ticket Booking System

A web-based platform for browsing, booking, and managing campus event tickets at Adama Science and Technology University (ASTU). Our group built this as part of a course project to apply what we learned about full-stack web development, database design, and user interface design.

## What It Does

- **Browse Events** — Students can view upcoming campus events filtered by category (academic, cultural, sports, social, workshop) and search by name.
- **Book Tickets** — Authenticated students can reserve a seat by selecting a seat number and receiving a unique booking code.
- **Manage Tickets** — Students can view their active and past bookings and cancel bookings if needed.
- **Admin Dashboard** — Admin users can create, edit, and delete events, change event status, and view booking statistics.
- **User Profiles** — Each user has a profile with their name, student ID, department, and phone number.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS with custom ASTU-themed colors |
| Icons | Lucide React |
| Backend & Database | Supabase (PostgreSQL + Auth + Row Level Security) |
| Routing | React Router DOM v6 |

## Design

We took color inspiration from the ASTU logo, which uses **green and blue**. The interface uses a dark theme with glassmorphism cards, glowing accents, and smooth animations to give it a modern, premium feel. The design is fully responsive and works on mobile, tablet, and desktop.

## Project Structure

```
src/
├── components/       # Reusable UI components (Navbar, Footer, EventCard, Modal, Loader)
├── context/          # Auth context provider
├── lib/               # Supabase client setup
├── pages/             # Page components (Home, EventDetail, MyTickets, SignIn, SignUp, Profile, Admin)
├── types/             # TypeScript type definitions
├── App.tsx            # Main app with routing
├── main.tsx           # Entry point
└── index.css          # Global styles + Tailwind
```

## Database Schema

Our database has four tables:

1. **profiles** — Extends Supabase's built-in auth.users with full name, role (student/admin), student ID, department, and phone.
2. **events** — Campus events with title, description, date, venue, capacity, available seats, price, image, category, and status.
3. **bookings** — Ticket bookings linking a user to an event, with seat number, booking code, and check-in status.
4. **waitlist** — Waitlist entries for sold-out events.

All tables have Row Level Security (RLS) enabled:
- Anyone can browse events (no login required).
- Students can only see and manage their own bookings.
- Admins can manage all events and view all bookings.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/IamMachir/campus-event-ticket-booking.git
cd campus-event-ticket-booking

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

The project uses Supabase for the backend. The connection details are already configured in the `.env` file:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## How to Use

### As a Student

1. Visit the home page to browse upcoming events.
2. Filter by category or search for a specific event.
3. Click on an event to see full details.
4. Sign up or sign in to book a seat.
5. Choose a seat number and confirm your booking.
6. View your tickets under "My Tickets" and cancel if needed.

### As an Admin

1. Sign in with an admin account.
2. Go to the Admin dashboard from the navigation bar.
3. Create new events, edit existing ones, or change event status.
4. View booking statistics on the dashboard.

## Group Members

- Machir (Team Lead)
- [Add other group member names here]

## What We Learned

- Designing a normalized relational database schema with proper foreign keys and constraints.
- Implementing Row Level Security policies for multi-role access control.
- Building a responsive React frontend with TypeScript type safety.
- Creating a clean, modern UI with Tailwind CSS and thoughtful animations.
- Managing user authentication flows with Supabase Auth.

## Future Improvements

- Email notifications when booking is confirmed or event is cancelled.
- QR code generation for ticket verification at the door.
- Admin check-in system to mark attendees as present.
- Waitlist auto-promotion when seats become available.
- Event calendar view for better date navigation.
- Mobile app version using React Native.

## License

This project was created for academic purposes as part of a course requirement at Adama Science and Technology University.
