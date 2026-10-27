import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Frontend Guardians Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches guardians list with query filters', async () => {
    const mockGuardians = [
      {
        _id: 'g-1',
        name: 'Rahul Sharma',
        relationship: 'Father',
        phone: '+91 98765 43210',
        email: 'rahul.sharma@example.com',
        wards: [{ _id: '1', name: 'Aarav Sharma', class: '5A' }],
      },
    ];

    (axios.get as any).mockResolvedValueOnce({
      data: {
        data: mockGuardians,
        source: 'database',
      },
    });

    const res = await axios.get('/api/v1/guardians', {
      params: { search: 'Rahul', relationship: 'Father' },
      withCredentials: true,
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/guardians', {
      params: { search: 'Rahul', relationship: 'Father' },
      withCredentials: true,
    });
    expect(res.data.data).toEqual(mockGuardians);
  });

  it('submits guardian create payload', async () => {
    const payload = {
      name: 'Neha Patel',
      relationship: 'Mother',
      phone: '+91 98765 43211',
      email: 'neha.patel@example.com',
      occupation: 'Doctor',
    };

    (axios.post as any).mockResolvedValueOnce({
      data: { data: { _id: 'g-2', ...payload }, message: 'Registered' },
    });

    const res = await axios.post('/api/v1/guardians', payload, {
      withCredentials: true,
    });

    expect(axios.post).toHaveBeenCalledWith('/api/v1/guardians', payload, {
      withCredentials: true,
    });
    expect(res.data.data.name).toBe('Neha Patel');
  });

  it('submits guardian archive request', async () => {
    (axios.delete as any).mockResolvedValueOnce({
      data: { message: 'Guardian archived successfully' },
    });

    const res = await axios.delete('/api/v1/guardians/g-1', {
      withCredentials: true,
    });

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/guardians/g-1', {
      withCredentials: true,
    });
    expect(res.data.message).toBe('Guardian archived successfully');
  });
});
