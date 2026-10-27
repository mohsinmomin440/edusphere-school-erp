import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { login, logout, getMe } from './auth';

vi.mock('axios');

describe('Web Auth API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login sends credentials to /api/v1/auth/login with withCredentials: true', async () => {
    const mockUserData = { id: 'user-1', name: 'Admin', role: 'Super Administrator' };
    (axios.post as any).mockResolvedValueOnce({ data: { user: mockUserData } });

    const payload = { email: 'admin@edusphere.com', password: 'password123' };
    const result = await login(payload);

    expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/login', payload, {
      withCredentials: true,
    });
    expect(result).toEqual({ user: mockUserData });
  });

  it('logout calls /api/v1/auth/logout with withCredentials: true', async () => {
    (axios.post as any).mockResolvedValueOnce({ data: { message: 'Logged out' } });
    const result = await logout();
    expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/logout', {}, { withCredentials: true });
    expect(result).toEqual({ message: 'Logged out' });
  });

  it('getMe calls /api/v1/auth/me with withCredentials: true', async () => {
    const mockUserData = { id: 'user-1', name: 'Admin' };
    (axios.get as any).mockResolvedValueOnce({ data: { user: mockUserData } });
    const result = await getMe();
    expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/me', { withCredentials: true });
    expect(result).toEqual({ user: mockUserData });
  });

  it('propagates error when login request fails', async () => {
    (axios.post as any).mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(
      login({ email: 'admin@edusphere.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });
});
