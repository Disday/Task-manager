// @ts-check

import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test session', () => {
  let app;
  let knex;
  let testData;

  beforeAll(async () => {
    app = fastify({ logger: { prettyPrint: false } });
    await init(app);
    knex = app.objection.knex;
    await knex.migrate.latest();
    await prepareData(app);
    testData = getTestData();
  });

  test('test sign in / sign out', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newSession'),
    });

    expect(response.statusCode).toBe(200);

    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
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
      url: app.reverse('session'),
      cookies: cookie,
    });
    
    expect(responseSignOut.statusCode).toBe(302);
  });

  test('sign in - unexistent user', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.new,
      },
    });
    expect(responseSignIn.statusCode).toBe(401);
  });

  afterAll(async () => {
    // await knex.migrate.rollback();
    await app.close();
  });
});
