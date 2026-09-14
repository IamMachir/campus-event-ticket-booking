const crypto = require('crypto');

function generateTicketCode() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = { generateTicketCode };
