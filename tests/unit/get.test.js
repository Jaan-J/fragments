// tests/unit/get.test.js
// const { Fragment } = require('../../src/model/fragment');
const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});

// describe('GET /v1/fragments/:id', () => {
//   test('fragment data is returned by id', async () => {
//     const fragment = new Fragment({
//       id: '1',
//       type: 'text/plain',
//       size: 5,
//       data: Buffer.from('hello'),
//       ownerId: 'user1@email.com',
//     });

//     fragment.save();

//     const res = await request(app).get('/v1/fragments/1').auth('user1@email.com', 'password1');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('ok');
//     expect(res.body['Content-Type']).toBe('text/plain');
//     expect(res.body['Content-Length']).toBe(5);
//     expect(res.body.data).toBe('hello');
//   });
// });

// describe('GET /v1/fragments/:id/info', () => {
//   test('all fragment metadata is returned by id', async () => {
//     const fragment = new Fragment({
//       id: '1',
//       type: 'text/plain',
//       size: 5,
//       data: Buffer.from('hello'),
//       ownerId: 'user1@email.com',
//       created: new Date().toISOString(),
//       updated: new Date().toISOString(),
//     });

//     fragment.save();

//     const res = await request(app).get('/v1/fragments/1/info').auth('user1@email.com', 'password1');
//     expect(res.statusCode).toBe(200);
//     expect(res.body.status).toBe('ok');
//     expect(res.body.type).toBe('text/plain');
//     expect(res.body.size).toBe(5);
//     expect(res.body.updated).toBe(fragment.updated);
//     expect(res.body.created).toBe(fragment.created);
//     expect(res.body.ownerId).toBe('user1@email.com');
//   });
// });
