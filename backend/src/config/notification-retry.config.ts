function getPositiveInteger(
  variableName: string,
  fallback: number,
): number {
  const rawValue = process.env[variableName]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `${variableName} must be a positive integer.`,
    );
  }

  return value;
}

export const notificationRetryConfig = {
  maxAttempts: getPositiveInteger(
    "NOTIFICATION_MAX_ATTEMPTS",
    3,
  ),
  retryDelayMs: getPositiveInteger(
    "NOTIFICATION_RETRY_DELAY_MS",
    1_000,
  ),
};