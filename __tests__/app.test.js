import fastify from 'fastify';
import init from '../server/plugin.js';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('requests', () => {
  test('GET 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('root'),
    });
    expect(res.statusCode).toBe(200);
  });

  it('GET 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/wrong-path',
    });
    expect(res.statusCode).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
