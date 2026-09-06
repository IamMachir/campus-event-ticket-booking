const express = require('express');
const request = require('supertest');
const {
  handleValidation,
  registerRules,
  loginRules,
  eventRules,
  bookingRules,
} = require('../src/middleware/validation');

function buildApp(rules) {
  const app = express();
  app.use(express.json());
  app.post('/test', rules, handleValidation, (req, res) => res.json({ ok: true }));
  return app;
}

describe('registerRules', () => {
  const app = buildApp(registerRules);

  it('rejects missing fullName, invalid email, and short password', async () => {
    const res = await request(app)
      .post('/test')
      .send({ fullName: '', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
    const messages = res.body.details.map((d) => d.msg);
    expect(messages).toContain('fullName is required');
    expect(messages).toContain('A valid email is required');
    expect(messages).toContain('Password must be at least 6 characters');
  });

  it('accepts valid registration data', async () => {
    const res = await request(app)
      .post('/test')
      .send({ fullName: 'Test User', email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
  });
});

describe('loginRules', () => {
  const app = buildApp(loginRules);

  it('rejects invalid email and missing password', async () => {
    const res = await request(app).post('/test').send({ email: 'bad-email' });
    expect(res.status).toBe(400);
  });

  it('accepts valid login data', async () => {
    const res = await request(app).post('/test').send({ email: 'a@b.com', password: 'x' });
    expect(res.status).toBe(200);
  });
});

describe('eventRules', () => {
  const app = buildApp(eventRules);

  it('rejects missing title, bad date, and non-positive capacity', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: '', startTime: 'not-a-date', capacity: 0 });

    expect(res.status).toBe(400);
  });

  it('accepts a valid event payload', async () => {
    const res = await request(app).post('/test').send({
      title: 'Cultural Night',
      startTime: '2026-12-01T18:00:00Z',
      capacity: 100,
    });
    expect(res.status).toBe(200);
  });
});

describe('bookingRules', () => {
  const app = buildApp(bookingRules);

  it('rejects a non-integer eventId', async () => {
    const res = await request(app).post('/test').send({ eventId: 'abc' });
    expect(res.status).toBe(400);
  });

  it('accepts a valid eventId', async () => {
    const res = await request(app).post('/test').send({ eventId: 5 });
    expect(res.status).toBe(200);
  });
});
