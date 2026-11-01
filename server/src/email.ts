export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validEmail(email: string): boolean {
  return email.length > 0 && email.length <= 254 && EMAIL.test(email);
}
