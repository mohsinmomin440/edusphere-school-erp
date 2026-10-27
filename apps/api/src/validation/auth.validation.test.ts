import { describe, it, expect } from 'vitest';
import { validateLogin, loginSchema } from './auth.validation';

describe('Auth Validation', () => {
  it('should accept valid credentials', () => {
    const valid = { email: 'admin@edusphere.com', password: 'password123' };
    const { error, value } = validateLogin(valid);
    expect(error).toBeNull();
    expect(value).toEqual(valid);
  });

  it('should reject invalid email format', () => {
    const invalid = { email: 'not-an-email', password: 'password123' };
    const { error, value } = validateLogin(invalid);
    expect(error).not.toBeNull();
    expect(value).toBeNull();
  });

  it('should reject password shorter than 8 characters', () => {
    const invalid = { email: 'admin@edusphere.com', password: 'short' };
    const { error, value } = validateLogin(invalid);
    expect(error).not.toBeNull();
    expect(value).toBeNull();
  });

  it('schema parse should fail on missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
