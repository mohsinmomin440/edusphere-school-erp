import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Health Routes', () => {
  it('GET /api/v1/health should return status ok with ISO timestamp', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(new Date(response.body.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('GET /health should also return status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });
});
