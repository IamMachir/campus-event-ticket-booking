process.env.JWT_SECRET = 'test-secret';
const jwt = require('jsonwebtoken');
const { requireAuth, requireRole } = require('../src/middleware/auth');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('requireAuth', () => {
  it('rejects requests with no authorization header', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an invalid token', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts a valid token and attaches the decoded user to req', () => {
    const token = jwt.sign({ id: 1, email: 'a@b.com', role: 'student' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 1, email: 'a@b.com', role: 'student' });
  });
});

describe('requireRole', () => {
  it('allows a user whose role is in the allowed list', () => {
    const req = { user: { role: 'organizer' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('organizer', 'admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('rejects a user whose role is not allowed', () => {
    const req = { user: { role: 'student' } };
    const res = mockRes();
    const next = jest.fn();

    requireRole('organizer', 'admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
