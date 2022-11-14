// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('Return a success response if a fragment is created', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send('955')
      .set('Content-Type', 'text/plain');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(false);
  });

  test('Return success if ID is used to create fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send({ body: 'DPS' })
      .set({ id: '1234', contentType: 'text/plain' });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(false);
  });
});
