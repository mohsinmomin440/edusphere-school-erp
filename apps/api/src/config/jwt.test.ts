import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAuthSecret } from './jwt';

describe('JWT Configuration & Secret Security', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns default development secret when AUTH_SECRET is not set in non-production mode', () => {
    delete process.env.AUTH_SECRET;
    process.env.NODE_ENV = 'development';

    const secret = getAuthSecret();
    expect(secret).toBe('edusphere-local-dev-secret-minimum-32-chars-long');
  });

  it('returns configured AUTH_SECRET in development mode', () => {
    process.env.NODE_ENV = 'development';
    process.env.AUTH_SECRET = 'my-custom-dev-secret-key-12345';

    const secret = getAuthSecret();
    expect(secret).toBe('my-custom-dev-secret-key-12345');
  });

  it('throws fatal error in production when AUTH_SECRET is missing', () => {
    delete process.env.AUTH_SECRET;
    process.env.NODE_ENV = 'production';

    expect(() => getAuthSecret()).toThrow(
      'FATAL SECURITY ERROR: AUTH_SECRET environment variable is missing in production.'
    );
  });

  it('throws fatal error in production when AUTH_SECRET is too short (<32 chars)', () => {
    process.env.NODE_ENV = 'production';
    process.env.AUTH_SECRET = 'too-short-secret';

    expect(() => getAuthSecret()).toThrow(
      'FATAL SECURITY ERROR: AUTH_SECRET must be at least 32 characters in production.'
    );
  });

  it('accepts valid 32+ character AUTH_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    const strongSecret = 'super-secure-production-jwt-secret-key-32chars!';
    process.env.AUTH_SECRET = strongSecret;

    expect(getAuthSecret()).toBe(strongSecret);
  });
});
