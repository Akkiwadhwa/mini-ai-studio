import request from 'supertest';
import app from '../src/index';
describe('Auth', () => {
  const email = `user${Math.floor(Math.random()*10000)}@test.com`;
  const password = 'secret123';
  it('signup -> 201', async () => {
    const res = await request(app).post('/auth/signup').send({ email, password });
    expect(res.status).toBe(201); expect(res.body.token).toBeTruthy();
  });
  it('login -> 200', async () => {
    const res = await request(app).post('/auth/login').send({ email, password });
    expect(res.status).toBe(200); expect(res.body.token).toBeTruthy();
  });
});
