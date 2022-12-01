// tests/unit/get.id.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('data of posted fragment can be retrieved by id', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
  });

  test('requested fragment data by invalid id should fail', async () => {
    const res = await request(app)
      .get(`/v1/fragments/randomId`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });
});

describe('GET /fragments/:id.ext', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/:id.ext').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/:id.ext')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('unsupported extension types are denied', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.xml`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(415);
    expect(getResponse.body.error.message).toBe('Extension type is not supported.');
  });

  test('fragment can convert from MD to html', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/markdown',
        body: '# This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.headers['content-type']).toBe('text/html; charset=utf-8');
  });
});
