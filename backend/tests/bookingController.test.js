jest.mock('../src/config/db', () => {
  const mockConn = {
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn(),
    query: jest.fn(),
  };
  return {
    __mockConn: mockConn,
    getConnection: jest.fn().mockResolvedValue(mockConn),
  query: jest.fn(),
  mockReset: () => {
    mockConn.beginTransaction.mockClear();
    mockConn.commit.mockClear();
    mockConn.rollback.mockClear();
    mockConn.release.mockClear();
    mockConn.query.mockClear();
  },
  mockQueryResult: (rows) => {
    mockConn.query.mockReset();
    mockConn.query.mockResolvedValue([rows]);
  },
  mockQuerySequence: (results) => {
    mockConn.query.mockReset();
    results.forEach((r) => mockConn.query.mockResolvedValueOnce([r]));
    mockConn.query.mockResolvedValue([[]]);
  },
  mockQueryError: (err) => {
    mockConn.query.mockReset();
    mockConn.query.mockRejectedValue(err);
  },
  mockConn: mockConn,
  default: { getConnection: jest.fn().mockResolvedValue(mockConn) },
  __esModule: true,
  ...mockConn,
  getConnection: jest.fn().mockResolvedValue(mockConn),
  query: jest.fn(),
  beginTransaction: mockConn.beginTransaction,
  commit: mockConn.commit,
  rollback: mockConn.rollback,
  release: mockConn.release,
  };
});

jest.mock('../src/models/bookingModel');
jest.mock('../src/models/eventModel');
jest.mock('../src/models/userModel');
jest.mock('../src/utils/email');
jest.mock('qrcode', () => ({ toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,FAKE_QR') }));

const pool = require('../src/config/db');
const { cancelBooking, findById, findByTicketCode, markCheckedIn } = require('../src/models/bookingModel');
const { decrementSeatsBooked } = require('../src/models/eventModel');
const { findUserById } = require('../src/models/userModel');
const { sendBookingConfirmation } = require('../src/utils/email');
const { bookEvent, cancelMyBooking, checkIn } = require('../src/controllers/bookingController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  pool.mockReset();
  findUserById.mockResolvedValue({ id: 1, email: 'a@b.com', full_name: 'Test User' });
  sendBookingConfirmation.mockResolvedValue({ sent: false });
});

describe('bookEvent', () => {
  it('rejects booking a fully booked event', async () => {
    pool.mockQuerySequence([
      [{ id: 1, seats_booked: 10, capacity: 10, title: 'Full Event', start_time: '2025-01-01' }],
      [],
    ]);
    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(pool.__mockConn.rollback).toHaveBeenCalled();
  });

  it('rejects a duplicate booking for the same event', async () => {
    pool.mockQuerySequence([
      [{ id: 1, seats_booked: 2, capacity: 10, title: 'Event', start_time: '2025-01-01' }],
      [{ id: 99 }],
    ]);
    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(pool.__mockConn.rollback).toHaveBeenCalled();
  });

  it('allows booking when the event has space and no existing booking', async () => {
    pool.mockQuerySequence([
      [{ id: 1, seats_booked: 2, capacity: 10, title: 'Event', start_time: '2025-01-01' }],
      [],
      { insertId: 42 },
      { affectedRows: 1 },
    ]);
    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

    expect(pool.__mockConn.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('does not fail the booking even if a cancelled booking exists for the same event', async () => {
    pool.mockQuerySequence([
      [{ id: 1, seats_booked: 2, capacity: 10, title: 'Event', start_time: '2025-01-01' }],
      [],
      { insertId: 42 },
      { affectedRows: 1 },
    ]);
    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

    expect(pool.__mockConn.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('cancelMyBooking', () => {
  it('rejects cancelling someone else\'s booking', async () => {
    findById.mockResolvedValue({ id: 5, user_id: 99, status: 'booked', event_id: 1 });
    const req = { params: { id: 5 }, user: { id: 1 } };
    const res = mockRes();

    await cancelMyBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(cancelBooking).not.toHaveBeenCalled();
  });

  it('rejects cancelling an already-cancelled booking', async () => {
    findById.mockResolvedValue({ id: 5, user_id: 1, status: 'cancelled', event_id: 1 });
    const req = { params: { id: 5 }, user: { id: 1 } };
    const res = mockRes();

    await cancelMyBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('cancels a valid booking and releases the seat', async () => {
    findById.mockResolvedValue({ id: 5, user_id: 1, status: 'booked', event_id: 1 });
    const req = { params: { id: 5 }, user: { id: 1 } };
    const res = mockRes();

    await cancelMyBooking(req, res);

    expect(cancelBooking).toHaveBeenCalledWith(5);
    expect(decrementSeatsBooked).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Booking cancelled' });
  });
});

describe('checkIn', () => {
  it('rejects an unknown ticket code', async () => {
    findByTicketCode.mockResolvedValue(null);
    const req = { body: { ticketCode: 'UNKNOWN' }, user: { id: 1, role: 'organizer' } };
    const res = mockRes();

    await checkIn(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('rejects an already checked-in ticket', async () => {
    findByTicketCode.mockResolvedValue({ id: 1, status: 'checked_in', ticket_code: 'ABC123', organizer_id: 1 });
    const req = { body: { ticketCode: 'ABC123' }, user: { id: 1, role: 'organizer' } };
    const res = mockRes();

    await checkIn(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('checks in a valid booked ticket', async () => {
    findByTicketCode.mockResolvedValue({ id: 1, status: 'booked', ticket_code: 'ABC123', organizer_id: 1 });
    markCheckedIn.mockResolvedValue(1);
    const req = { body: { ticketCode: 'ABC123' }, user: { id: 1, role: 'organizer' } };
    const res = mockRes();

    await checkIn(req, res);

    expect(markCheckedIn).toHaveBeenCalledWith('ABC123');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Checked in successfully', ticketCode: 'ABC123' }));
  });
});
