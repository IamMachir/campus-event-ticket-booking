// Central role definitions - single source of truth for every role check.
// Values must match the users.role ENUM in migrations/001_init_schema.sql.
const ROLES = {
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

// Roles a user may pick during public self-registration.
// Admin accounts are provisioned internally, never via public sign-up.
const PUBLIC_ROLES = [ROLES.STUDENT, ROLES.ORGANIZER];

const ALL_ROLES = [ROLES.STUDENT, ROLES.ORGANIZER, ROLES.ADMIN];

module.exports = { ROLES, PUBLIC_ROLES, ALL_ROLES };
