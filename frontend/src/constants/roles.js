// Central role definitions - single source of truth on the frontend.
// Values must match backend/src/constants/roles.js and the users.role ENUM.
export const ROLES = {
  STUDENT: 'student',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

// Roles selectable during public sign-up. Admin accounts are provisioned
// internally and can never be chosen at registration.
export const PUBLIC_ROLES = [ROLES.STUDENT, ROLES.ORGANIZER];

export const ROLE_LABELS = {
  student: 'Student',
  organizer: 'Event Organizer',
  admin: 'Admin',
};
