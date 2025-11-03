import path from 'path';
import request from 'supertest';
import app from '../src/index';
import { jest } from '@jest/globals';
import * as generationService from '../src/services/generationService.js';

async function createToken() {
  const email = `gen-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;
  const password = 'secret123';
  await request(app).post('/auth/signup').send({ email, password });
  const res = await request(app).post('/auth/login').send({ email, password });
  return res.body.token as string;
}

describe('Generations', () => {
  const img = path.join(process.cwd(), 'tests', 'fixtures', 'tiny.png');

  beforeEach(() => {
    jest.spyOn(generationService, 'simulateGenerationDelay').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects unauthorized access with 401 error payload', async () => {
    const res = await request(app).get('/generations');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Missing Authorization header' });
  });

  it('creates a generation and returns it in history', async () => {
    const t = await createToken();
    jest.spyOn(generationService, 'shouldSimulateOverload').mockReturnValue(false);

    const createRes = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${t}`)
      .field('prompt', 'Red jacket')
      .field('style', 'Streetwear')
      .attach('image', img);

    expect(createRes.status).toBe(201);
    expect(createRes.body).toEqual(
      expect.objectContaining({
        prompt: 'Red jacket',
        style: 'Streetwear',
        status: 'succeeded',
        imageUrl: expect.stringContaining('/uploads/')
      })
    );

    const listRes = await request(app).get('/generations').set('Authorization', `Bearer ${t}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prompt: 'Red jacket',
          style: 'Streetwear'
        })
      ])
    );
  });

  it('returns 503 with message when overload is simulated', async () => {
    const t = await createToken();
    jest.spyOn(generationService, 'shouldSimulateOverload').mockReturnValue(true);

    const res = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${t}`)
      .field('prompt', 'Outerwear concept')
      .field('style', 'Minimal')
      .attach('image', img);

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ message: 'Model overloaded' });
  });

  it('enforces validation and returns 400 error payload when image is missing', async () => {
    const t = await createToken();
    jest.spyOn(generationService, 'shouldSimulateOverload').mockReturnValue(false);

    const res = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${t}`)
      .field('prompt', 'Need an image')
      .field('style', 'Streetwear');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Image upload is required' });
  });

  it('enforces validation and returns 400 error payload when style is invalid', async () => {
    const t = await createToken();
    jest.spyOn(generationService, 'shouldSimulateOverload').mockReturnValue(false);

    const res = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${t}`)
      .field('prompt', 'Invalid style example')
      .field('style', 'Casual')
      .attach('image', img);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Invalid enum value');
  });
});
