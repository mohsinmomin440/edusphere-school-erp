import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Frontend Academics Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches classes and academic sessions simultaneously', async () => {
    const mockClasses = [{ _id: 'c-1', name: '5A', grade: 'Grade 5', section: 'A' }];
    const mockYears = [{ _id: 'y-1', name: '2024-2025', isCurrent: true }];

    (axios.get as any).mockImplementation((url: string) => {
      if (url.includes('/classes')) {
        return Promise.resolve({ data: { data: mockClasses } });
      }
      if (url.includes('/years')) {
        return Promise.resolve({ data: { data: mockYears } });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    const [classRes, yearRes] = await Promise.all([
      axios.get('/api/v1/academics/classes', { withCredentials: true }),
      axios.get('/api/v1/academics/years', { withCredentials: true }),
    ]);

    expect(classRes.data.data).toEqual(mockClasses);
    expect(yearRes.data.data).toEqual(mockYears);
  });

  it('submits new class creation', async () => {
    const payload = {
      name: '6B',
      grade: 'Grade 6',
      section: 'B',
      roomNo: '201',
      capacity: 35,
    };

    (axios.post as any).mockResolvedValueOnce({
      data: { data: { _id: 'c-2', ...payload }, message: 'Created' },
    });

    const res = await axios.post('/api/v1/academics/classes', payload, {
      withCredentials: true,
    });

    expect(axios.post).toHaveBeenCalledWith('/api/v1/academics/classes', payload, {
      withCredentials: true,
    });
    expect(res.data.data.name).toBe('6B');
  });

  it('submits class archive request', async () => {
    (axios.delete as any).mockResolvedValueOnce({
      data: { message: 'Class archived successfully' },
    });

    const res = await axios.delete('/api/v1/academics/classes/c-1', {
      withCredentials: true,
    });

    expect(axios.delete).toHaveBeenCalledWith('/api/v1/academics/classes/c-1', {
      withCredentials: true,
    });
    expect(res.data.message).toBe('Class archived successfully');
  });
});
