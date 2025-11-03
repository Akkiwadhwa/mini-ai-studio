import request from 'supertest';
import app from '../src/index';

function uniqueEmail() {
  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;
}

describe('Auth', () => {
  const password = 'secret123';

  it('signup -> 201', async () => {
    const email = uniqueEmail();
    const res = await request(app).post('/auth/signup').send({ email, password });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toEqual(expect.objectContaining({ email }));
  });

  it('login -> 200', async () => {
    const email = uniqueEmail();
    await request(app).post('/auth/signup').send({ email, password });

    const res = await request(app).post('/auth/login').send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toEqual(expect.objectContaining({ email }));
  });

  it('rejects invalid signup data with 400 error payload', async () => {
    const res = await request(app).post('/auth/signup').send({ email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: expect.stringContaining('Invalid email')
    });
    expect(res.body.error).toContain('String must contain at least 6 character(s)');
  });

  it('rejects invalid credentials with 401 error payload', async () => {
    const email = uniqueEmail();
    await request(app).post('/auth/signup').send({ email, password });

    const res = await request(app).post('/auth/login').send({ email, password: 'wrong-pass' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: 'Invalid credentials'
    });
  });
});
