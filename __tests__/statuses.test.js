import _ from 'lodash';
import fastify from 'fastify';
import init from '../server/plugin.js';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test statuses CRUD', () => {
  let app, knex, route, findStatusByName;
  let models;
  let cookie;
  const testData = getTestData();
  const userParams = testData.users.existing;

  beforeAll(async () => {
    app = fastify({
      // logger: { prettyPrint: false }
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;
    route = app.reverse;
    findStatusByName = (name) => app.objection.models.status.query().findOne({ name });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    cookie = await signIn(app, userParams);
  });

  test.each([
    ['index', 'statuses',],
    ['new', 'newStatus',],
  ])('%s', async (name, routeName) => {
    const authResponse = await app.inject({
      method: 'GET',
      url: route(routeName),
      cookies: cookie,
    });
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await app.inject({
      method: 'GET',
      url: route(routeName),
    });
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('editStatus', async () => {
    const data = { name: 'New status' };
    const responseCreate = await app.inject({
      method: 'POST',
      url: route('statuses'),
      payload: { data },
      cookies: cookie,
    });
    expect(responseCreate.statusCode).toBe(201);

    // const s = await app.objection.models.status.query();
    const { id } = await findStatusByName(data.name);
    const authResponse = await app.inject({
      method: 'GET',
      url: route('editStatus', { id }),
      cookies: cookie,
    });
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await app.inject({
      method: 'GET',
      url: route('editStatus', { id }),
    });
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('create/patch/delete', async () => {
    // const s = await app.objection.models.status.query();
    const data = { name: 'New status' };
    const nonAuthCreate = await app.inject({
      method: 'POST',
      url: route('statuses'),
      payload: { data },
    });
    expect(nonAuthCreate.statusCode).toBe(302);

    // const s1 = await app.objection.models.status.query();
    const authCreate = await app.inject({
      method: 'POST',
      url: route('statuses'),
      payload: { data },
      cookies: cookie,
    });
    expect(authCreate.statusCode).toBe(201);

    const status = await findStatusByName(data.name);
    expect(status).toMatchObject(data);

    const { id } = status;
    const newData = { name: 'New name' };
    const nonAuthPatch = await app.inject({
      method: 'PATCH',
      url: route('status', { id }),
      payload: { data: newData },
    });
    expect(nonAuthPatch.statusCode).toBe(302);

    const authPatch = await app.inject({
      method: 'PATCH',
      url: route('status'),
      payload: { data: newData },
      cookies: cookie,
    });
    expect(authPatch.statusCode).toBe(200);

    const newStatus = await findStatusByName(newData.name);
    expect(newStatus).toMatchObject(newData);

    const nonAuthDelete = await app.inject({
      method: 'DELETE',
      url: route('status', { id }),
    });
    expect(nonAuthDelete.statusCode).toBe(302);

    const authDelete = await app.inject({
      method: 'DELETE',
      url: route('status', { id }),
      cookies: cookie,
    });
    expect(authDelete.statusCode).toBe(204);

    const deletedStatus = await findStatusByName(newData.name);
    expect(deletedStatus).toBeUndefined();
  });



  afterEach(async () => {
    await knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
