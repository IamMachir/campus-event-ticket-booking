jest.mock('../src/models/bookingModel');
jest.mock('../src/models/eventModel');
jest.mock('../src/models/userModel');
jest.mock('../src/utils/email');

const { getBookingsByUser, createBooking, cancelBooking, findById } = require('../src/models/bookingModel');
const { getEventById, incrementSeatsBooked, decrementSeatsBooked } = require('../src/models/eventModel');
const { findUserById } = require('../src/models/userModel');
const { sendBookingConfirmation } = require('../src/utils/email');
const { bookEvent, cancelMyBooking } = require('../src/controllers/bookingController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
  findUserById.mockResolvedValue({ id: 1, email: 'a@b.com', full_name: 'Test User' });
  sendBookingConfirmation.mockResolvedValue({ sent: false });
});

describe('bookEvent', () => {
  it('rejects booking a fully booked event', async () => {
    getEventById.mockResolvedValue({ id: 1, seats_booked: 10, capacity: 10, title: 'Full Event' });
    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('rejects a duplicate booking for the same event', async () => {
    getEventById.mockResolvedValue({ id: 1, seats_booked: 2, capacity: 10, title: 'Event' });
    getBookingsByUser.mockResolvedValue([{ event_id: 1, status: 'booked' }]);
    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('allows booking when the event has space and no existing booking', async () => {
    getEventById.mockResolvedValue({
      id: 1,
      seats_booked: 2,
      capacity: 10,
      title: 'Event',
      start_time: new Date().toISOString(),
    });
    getBookingsByUser.mockResolvedValue([]);
    createBooking.mockResolvedValue(42);

    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

    expect(createBooking).toHaveBeenCalled();
    expect(incrementSeatsBooked).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('does not fail the booking even if a cancelled booking exists for the same event', async () => {
    getEventById.mockResolvedValue({
      id: 1,
      seats_booked: 2,
      capacity: 10,
      title: 'Event',
      start_time: new Date().toISOString(),
    });
    getBookingsByUser.mockResolvedValue([{ event_id: 1, status: 'cancelled' }]);
    createBooking.mockResolvedValue(42);

    const req = { body: { eventId: 1 }, user: { id: 1 } };
    const res = mockRes();

    await bookEvent(req, res);

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
