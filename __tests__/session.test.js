import fastify from 'fastify';
import init from '../server/plugin.js';
import getUtils from '../utils/utils.js';
import getAppUtils from '../utils/utils.js';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('test session', () => {
  // jest.setTimeout(30000)
  const { route, testData, prepareData } = getUtils(app);
  const { knex } = app.objection;

  beforeAll(async () => {
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(knex);
  });

  test('sign in / sign out', async () => {
    const response = await app.inject({
      method: 'GET',
      url: route('newSession'),
    });

    expect(response.statusCode).toBe(200);

    const responseSignIn = await app.inject({
      method: 'POST',
      url: route('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    expect(responseSignIn.statusCode).toBe(302);
    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };

    const responseSignOut = await app.inject({
      method: 'DELETE',
      url: route('session'),
      cookies: cookie,
    });

    expect(responseSignOut.statusCode).toBe(302);
  });

  test('sign in - unexistent user', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: route('session'),
      payload: {
        data: testData.users.new,
      },
    });
    expect(responseSignIn.statusCode).toBe(401);
  });

  afterEach(async () => {
    await knex('*').truncate;
  });

  afterAll(async () => {
    await app.close();
  });
});
