const { getCampusDayBounds, getCampusNow } = require('../src/utils/campusTime');

describe('campus time helpers', () => {
  it('uses Africa/Nairobi when calculating the campus date', () => {
    const instant = new Date('2026-09-20T21:30:00.000Z');

    expect(getCampusNow(instant)).toBe('2026-09-21 00:30:00');
    expect(getCampusDayBounds(instant)).toEqual({
      start: '2026-09-21 00:00:00',
      end: '2026-09-22 00:00:00',
    });
  });

  it('handles the end of a calendar month', () => {
    expect(getCampusDayBounds(new Date('2026-02-28T10:00:00.000Z'))).toEqual({
      start: '2026-02-28 00:00:00',
      end: '2026-03-01 00:00:00',
    });
  });
});