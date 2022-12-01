const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id/info').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/:id/info')
      .auth('invalid@email.com', 'not_the_password')
      .expect(401));

  test('metadata of posted fragment can be retrieved by id', async () => {
    const postFragment = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const fetchedFragment = await request(app)
      .get(`/v1/fragments/${postFragment.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(fetchedFragment.statusCode).toBe(200);
    expect(fetchedFragment.body.status).toBe('ok');
  });

  test('requesting fragments IDs that dont exist should return a 404', async () => {
    const res = await request(app)
      .get(`/v1/fragments/FakeFragmentID/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });
});
