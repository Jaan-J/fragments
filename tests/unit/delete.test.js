const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users can delete a fragment', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.status).toBe('ok');

    const deleteResponse = await request(app)
      .delete(`/v1/fragments/${postResponse.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(deleteResponse.body.status).toBe('ok');

    const getAllResponse = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1');

    expect(getAllResponse.body.fragments).toEqual([]);
  });

  test('If the id is not found, returns  status code 404 with an error message', async () => {
    const deleteResponse = await request(app)
      .delete(`/v1/fragments/randomId`)
      .auth('user1@email.com', 'password1');

    expect(deleteResponse.statusCode).toBe(404);
  });
});