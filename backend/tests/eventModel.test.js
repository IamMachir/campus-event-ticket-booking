jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const { buildDiscoveryQuery } = require('../src/models/eventModel');

describe('buildDiscoveryQuery', () => {
  const now = new Date('2026-09-20T21:30:00.000Z');

  it('builds a published today interval using the campus timezone', () => {
    const query = buildDiscoveryQuery({ view: 'today', now });

    expect(query.conditions).toContain("e.status = 'PUBLISHED'");
    expect(query.conditions).toContain('e.start_time < ? AND COALESCE(e.end_time, e.start_time) >= ?');
    expect(query.whereParams).toEqual(['2026-09-22 00:00:00', '2026-09-21 00:00:00']);
    expect(query.orderBy).toBe('e.start_time ASC, e.id ASC');
  });

  it('sorts all published events with upcoming events first', () => {
    const query = buildDiscoveryQuery({ view: 'all', now });

    expect(query.orderBy).toContain('(e.start_time < ?) ASC');
    expect(query.orderParams).toEqual(['2026-09-21 00:30:00', '2026-09-21 00:30:00']);
  });

  it('uses confirmed bookings to rank upcoming popular events', () => {
    const query = buildDiscoveryQuery({ view: 'popular', now });

    expect(query.joins).toContain('LEFT JOIN bookings');
    expect(query.orderBy).toContain("b.status IN ('booked', 'checked_in')");
    expect(query.whereParams).toEqual(['2026-09-21 00:30:00']);
  });
});