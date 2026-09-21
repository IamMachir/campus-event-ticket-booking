const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const { runMigrations } = require('./config/runMigrations');
const { processExpirations } = require('./controllers/bookingController');

const app = express();

// --- Security middleware (OWASP Top 10 mitigation) ---
// Sets standard security headers (helps against A05: Security Misconfiguration,
// and reduces XSS/clickjacking/MIME-sniffing risk).
app.use(helmet());
app.use(cors());
app.use(express.json());

// General API rate limit (mitigates brute-force and DoS-style abuse).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // generous general limit
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Stricter limit specifically on auth endpoints (mitigates A07: Identification
// and Authentication Failures via credential-stuffing/brute-force attempts).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 5000;

runMigrations()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    // Process ticket expirations + "1 day left" reminders on startup, then
    // every hour. Idempotent: already-expired bookings are skipped and
    // notifications are deduped by the notification model.
    processExpirations();
    setInterval(() => processExpirations(), 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (migrations skipped)`));
  });
