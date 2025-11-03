import request from 'supertest';
import app from '../src/index';
import path from 'path';
async function token() {
  const email = `g${Date.now()}@test.com`, password = 'secret123';
  await request(app).post('/auth/signup').send({ email, password });
  const res = await request(app).post('/auth/login').send({ email, password });
  return res.body.token as string;
}
describe('Generations', () => {
  const img = path.join(process.cwd(),'tests','fixtures','tiny.png');
  it('unauthorized -> 401', async () => {
    const res = await request(app).get('/generations');
    expect(res.status).toBe(401);
  });
  it('create or overloaded', async () => {
    const t = await token();
    const res = await request(app).post('/generations')
      .set('Authorization', `Bearer ${t}`)
      .field('prompt','Red jacket')
      .field('style','Streetwear')
      .attach('image', img);
    expect([201,503]).toContain(res.status);
  });
});
