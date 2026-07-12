import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('GET /api/watchlist (auth required)', () => {
  it('returns 401 without an Authorization header', async () => {
    const res = await request(app).get('/api/watchlist');
    expect(res.status).toBe(401);
  });

  it('returns 401 with a malformed Authorization header', async () => {
    const res = await request(app).get('/api/watchlist').set('Authorization', 'NotBearer abc');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid bearer token (Firebase not configured in test env)', async () => {
    const res = await request(app).get('/api/watchlist').set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/portfolio (auth required)', () => {
  it('returns 401 without credentials', async () => {
    const res = await request(app).get('/api/portfolio');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/alerts (auth required)', () => {
  it('returns 401 without credentials', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/dashboard (admin required)', () => {
  it('returns 401 without credentials', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });
});
