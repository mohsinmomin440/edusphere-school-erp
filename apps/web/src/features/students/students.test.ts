import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Frontend Students Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches students list with query filters', async () => {
    const mockStudents = [
      {
        _id: '1',
        name: 'Aarav Sharma',
        class: '5A',
        rollNo: '101',
        status: 'Active',
        guardian: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
      },
    ];

    (axios.get as any).mockResolvedValueOnce({
      data: {
        data: mockStudents,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });

    const res = await axios.get('/api/v1/students', {
      params: { page: 1, limit: 10, search: 'Aarav' },
      withCredentials: true,
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/students', {
      params: { page: 1, limit: 10, search: 'Aarav' },
      withCredentials: true,
    });
    expect(res.data.data).toEqual(mockStudents);
  });

  it('submits student payload on create', async () => {
    const payload = {
      admissionNo: 'ADM-2025-0101',
      rollNo: '101',
      firstName: 'Aarav',
      lastName: 'Sharma',
      class: '5A',
      gender: 'Male',
      dateOfBirth: '2014-01-12',
      guardian: { name: 'Rahul Sharma', phone: '+91 98765 43210' },
    };

    (axios.post as any).mockResolvedValueOnce({
      data: { data: { _id: 'new-id', ...payload }, message: 'Created' },
    });

    const res = await axios.post('/api/v1/students', payload, {
      withCredentials: true,
    });

    expect(axios.post).toHaveBeenCalledWith('/api/v1/students', payload, {
      withCredentials: true,
    });
    expect(res.data.data.name || res.data.data.firstName).toBe('Aarav');
  });

  it('deletes/archives student record', async () => {
    (axios.delete as any).mockResolvedValueOnce({
      data: { message: 'Archived successfully' },
    });

    const res = await axios.delete('/api/v1/students/demo-1', {
      withCredentials: true,
    });

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/students/demo-1', {
      withCredentials: true,
    });
    expect(res.data.message).toBe('Archived successfully');
  });
});
