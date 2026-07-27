export function normalizePhoneNumber(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/[^\d]/g, "");

  if (!normalized) {
    throw new Error("Phone number is required.");
  }

  return normalized;
}