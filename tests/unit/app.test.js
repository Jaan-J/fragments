const request = require('supertest');

const app = require('../../src/app');

describe('GET /', () => {
  test('should return HTTP 404 response', async () => {
    const res = await request(app).get('/false-path-here');
    expect(res.statusCode).toBe(404);
  });
});
