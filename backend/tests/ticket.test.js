const { generateTicketCode } = require('../src/utils/ticket');

describe('generateTicketCode', () => {
  it('generates a 32-character hex string', () => {
    const code = generateTicketCode();
    expect(code).toMatch(/^[0-9a-f]{32}$/);
  });

  it('generates a different code on each call', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateTicketCode());
    }
    expect(codes.size).toBe(100);
  });
});
