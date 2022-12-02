// tests/unit/put.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'not_the_password').expect(401));

  test('authenticated users can not update a fragment with different types data type.', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const putResponse = await request(app)
      .put(`/v1/fragments/${postResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/markdown',
        body: { data: 'fragment' },
      });

    expect(putResponse.statusCode).toBe(400);
  });

  test('authenticated users can update a fragment with same data type.', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const putResponse = await request(app)
      .put(`/v1/fragments/${postResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a updated fragment',
      });

    expect(putResponse.statusCode).toBe(200);
  });
});
