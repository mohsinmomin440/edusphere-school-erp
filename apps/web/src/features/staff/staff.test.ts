import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Frontend Staff Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches staff directory with department filters', async () => {
    const mockStaff = [
      {
        _id: 'staff-1',
        employeeId: 'EMP-01',
        name: 'Meenakshi Sundaram',
        department: 'Mathematics',
        designation: 'Head of Department',
        phone: '+91 98765 11001',
        status: 'Active',
      },
    ];

    (axios.get as any).mockResolvedValueOnce({
      data: {
        data: mockStaff,
        source: 'database',
      },
    });

    const res = await axios.get('/api/v1/staff', {
      params: { department: 'Mathematics' },
      withCredentials: true,
    });

    expect(axios.get).toHaveBeenCalledWith('/api/v1/staff', {
      params: { department: 'Mathematics' },
      withCredentials: true,
    });
    expect(res.data.data).toEqual(mockStaff);
  });

  it('submits staff member creation', async () => {
    const payload = {
      employeeId: 'EMP-05',
      firstName: 'Kavita',
      lastName: 'Iyer',
      email: 'k.iyer@edusphere.com',
      phone: '+91 98765 11005',
      department: 'Science',
      designation: 'Biology Teacher',
      status: 'Active',
    };

    (axios.post as any).mockResolvedValueOnce({
      data: { data: { _id: 'staff-5', name: 'Kavita Iyer', ...payload }, message: 'Created' },
    });

    const res = await axios.post('/api/v1/staff', payload, {
      withCredentials: true,
    });

    expect(axios.post).toHaveBeenCalledWith('/api/v1/staff', payload, {
      withCredentials: true,
    });
    expect(res.data.data.employeeId).toBe('EMP-05');
  });

  it('submits staff deactivation request', async () => {
    (axios.delete as any).mockResolvedValueOnce({
      data: { message: 'Staff member deactivated successfully' },
    });

    const res = await axios.delete('/api/v1/staff/staff-1', {
      withCredentials: true,
    });

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/staff/staff-1', {
      withCredentials: true,
    });
    expect(res.data.message).toBe('Staff member deactivated successfully');
  });
});
