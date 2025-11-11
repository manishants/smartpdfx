// Local-only default credentials fallback for development.
// These are used ONLY when env vars are missing.
// Change these locally as needed; prefer setting env in production.

export const LOCAL_AUTH_DEFAULTS = {
  SUPERADMIN_EMAIL: 'superadmin@smartpdfx.local',
  SUPERADMIN_PASSWORD: 'superadmin123',
  SUPERADMIN_EMAIL_2: '',
  SUPERADMIN_PASSWORD_2: '',
};