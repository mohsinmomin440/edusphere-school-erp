export const getAuthSecret = (): string => {
  const secret = process.env.AUTH_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.trim() === '') {
      throw new Error(
        'FATAL SECURITY ERROR: AUTH_SECRET environment variable is missing in production.'
      );
    }
    if (secret.length < 32) {
      throw new Error(
        'FATAL SECURITY ERROR: AUTH_SECRET must be at least 32 characters in production.'
      );
    }
    return secret;
  }

  // Development/test mode fallback only
  if (!secret || secret.trim() === '') {
    return 'edusphere-local-dev-secret-minimum-32-chars-long';
  }

  return secret;
};
