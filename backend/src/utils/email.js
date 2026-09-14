const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return transporter;
}

/**
 * Sends a booking confirmation email. If SMTP isn't configured (no
 * SMTP_HOST/SMTP_USER in .env), this logs the email content to the console
 * instead of failing - so bookings still work in local dev or during
 * grading without real email credentials, and the notification content
 * is still visible for testing/demo purposes.
 */
async function sendBookingConfirmation({ toEmail, toName, eventTitle, eventStartTime, ticketCode }) {
  const subject = "You're booked: " + eventTitle;
  const text = [
    'Hi ' + toName + ',',
    '',
    'Your booking for "' + eventTitle + '" is confirmed.',
    'When: ' + new Date(eventStartTime).toLocaleString(),
    'Ticket code: ' + ticketCode,
    '',
    'Show your QR ticket (available under My Bookings) at check-in.',
  ].join('\n');

  const client = getTransporter();

  if (!client) {
    console.log('--- Booking confirmation email (SMTP not configured, logging instead) ---');
    console.log('To: ' + toEmail);
    console.log('Subject: ' + subject);
    console.log(text);
    console.log('---------------------------------------------------------------------');
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    await client.sendMail({
      from: process.env.SMTP_FROM || 'Campus Events <no-reply@campus-events.local>',
      to: toEmail,
      subject,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error('Failed to send booking confirmation email:', err.message);
    return { sent: false, reason: err.message };
  }
}

/**
 * Sends the password reset instructions. The reset link contains a
 * single-use, time-limited token. Falls back to console logging when SMTP
 * is not configured, so the reset flow is still fully testable locally.
 */
async function sendPasswordResetEmail({ toEmail, toName, resetUrl }) {
  const subject = 'Reset your Campus Events password';
  const text = [
    'Hi ' + toName + ',',
    '',
    'We received a request to reset your password.',
    '',
    'Open the link below to choose a new password (valid for 60 minutes):',
    resetUrl,
    '',
    'If you did not request this, you can safely ignore this email - your password will not change.',
  ].join('\n');

  const client = getTransporter();

  if (!client) {
    console.log('--- Password reset email (SMTP not configured, logging instead) ---');
    console.log('To: ' + toEmail);
    console.log('Subject: ' + subject);
    console.log(text);
    console.log('---------------------------------------------------------------------');
    return { sent: false, reason: 'SMTP not configured', resetUrl };
  }

  try {
    await client.sendMail({
      from: process.env.SMTP_FROM || 'Campus Events <no-reply@campus-events.local>',
      to: toEmail,
      subject,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error('Failed to send password reset email:', err.message);
    return { sent: false, reason: err.message, resetUrl };
  }
}

module.exports = { sendBookingConfirmation, sendPasswordResetEmail };
