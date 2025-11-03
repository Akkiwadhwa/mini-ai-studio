import path from 'path';
import request from 'supertest';

let app: any;

async function createToken() {
  const email = `gen-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;
  const password = 'secret123';
  await request(app).post('/auth/signup').send({ email, password });
  const res = await request(app).post('/auth/login').send({ email, password });
  return res.body.token as string;
}

describe('Generations', () => {
  const img = path.join(process.cwd(), 'tests', 'fixtures', 'tiny.png');
  const originalForceOverload = process.env.FORCE_OVERLOAD;

  beforeAll(async () => {
    ({ default: app } = await import('../src/index.js'));
  });

  beforeEach(() => {
    process.env.FORCE_OVERLOAD = '0';
  });

  afterAll(() => {
    if (originalForceOverload === undefined) {
      delete process.env.FORCE_OVERLOAD;
    } else {
      process.env.FORCE_OVERLOAD = originalForceOverload;
    }
  });

  it('rejects unauthorized access with 401 error payload', async () => {
    const res = await request(app).get('/generations');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Missing Authorization header' });
  });

  it('creates a generation and returns it in history', async () => {
    const t = await createToken();

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
      expect.arrayContaining([expect.objectContaining({ prompt: 'Red jacket', style: 'Streetwear' })])
    );
  });

  it('returns 503 with message when overload is simulated', async () => {
    process.env.FORCE_OVERLOAD = '1';
    const t = await createToken();

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
