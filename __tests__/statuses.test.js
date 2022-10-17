import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      // logger: { prettyPrint: false }
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
  });

  const routes = [
    ['index', 'statuses',],
    ['new', 'newStatus',],
  ];
  test.each(routes)('%s', async (name, route) => {
    const userParams = testData.users.existing;
    const cookie = await signIn(app, userParams);

    const authResponse = await app.inject({
      method: 'GET',
      url: app.reverse(route),
      cookies: cookie,
    });
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await app.inject({
      method: 'GET',
      url: app.reverse(route),
    });
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  afterEach(async () => {
    await knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });

});
