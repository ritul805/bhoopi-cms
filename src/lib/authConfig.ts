export const ALLOWED_ADMIN_EMAIL = "hello@boopikids.com";

export function isAllowedAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === ALLOWED_ADMIN_EMAIL;
}
