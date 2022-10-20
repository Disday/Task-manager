import _ from 'lodash';
import fastify from 'fastify';
import init from '../server/plugin.js';
import getUtils from './helpers/index.js';
import { jest } from '@jest/globals';

describe('test taskStatuses CRUD', () => {
  jest.setTimeout(30000)
  let app, knex, route, findStatusByName, utils, createStatus;
  let models;
  let cookie;

  beforeAll(async () => {
    app = fastify({
      // logger: { prettyPrint: false }
    });
    await init(app);
    utils = getUtils(app);
    ({ createStatus } = utils)
    route = app.reverse;
    knex = app.objection.knex;
    models = app.objection.models;
    findStatusByName = (name) => app.objection.models.taskStatus.query().findOne({ name });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    const { signIn, getTestData, prepareData } = utils;
    await prepareData();
    const testData = getTestData();
    const userParams = testData.users.existing;
    cookie = await signIn(userParams);
  });

  test('index', async () => {
    const authResponse = await app.inject({
      method: 'GET',
      url: route('taskStatuses'),
      cookies: cookie
    });
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await app.inject({
      method: 'GET',
      url: route('taskStatuses'),
    });
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('new', async () => {
    const authResponse = await app.inject({
      method: 'GET',
      url: route('newTaskStatus'),
      cookies: cookie,
    });
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await app.inject({
      method: 'GET',
      url: route('newTaskStatus'),
    });
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('editStatus', async () => {
    const data = { name: 'New status' };
    const responseCreate = await createStatus(data, cookie);
    expect(responseCreate.statusCode).toBe(201);

    const { id } = await findStatusByName(data.name);
    const authResponse = await app.inject({
      method: 'GET',
      url: route('editTaskStatus', { id }),
      cookies: cookie,
    });
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await app.inject({
      method: 'GET',
      url: route('editTaskStatus', { id }),
    });
    expect(nonAuthResponse.statusCode).toBe(302);

    const nonexistStatusResponse = await app.inject({
      method: 'GET',
      url: route('editTaskStatus', { id: 'nonexistId' }),
      cookies: cookie,
    });
    expect(nonexistStatusResponse.statusCode).toBe(404);
  });

  test('create/patch/delete', async () => {
    const data = { name: 'New status' };
    const nonAuthCreate = await createStatus(data);
    expect(nonAuthCreate.statusCode).toBe(302);

    const authCreate = await createStatus(data, cookie);
    expect(authCreate.statusCode).toBe(201);

    const status = await findStatusByName(data.name);
    expect(status).toMatchObject(data);

    const { id } = status;
    const newData = { name: 'New name' };
    const nonAuthPatch = await app.inject({
      method: 'PATCH',
      url: route('taskStatus', { id }),
      payload: { data: newData },
    });
    expect(nonAuthPatch.statusCode).toBe(302);

    const authPatch = await app.inject({
      method: 'PATCH',
      url: route('taskStatus', { id }),
      payload: { data: newData },
      cookies: cookie,
    });
    expect(authPatch.statusCode).toBe(200);

    const newStatus = await findStatusByName(newData.name);
    expect(newStatus).toMatchObject(newData);

    const nonAuthDelete = await app.inject({
      method: 'DELETE',
      url: route('taskStatus', { id }),
    });
    expect(nonAuthDelete.statusCode).toBe(302);

    const authDelete = await app.inject({
      method: 'DELETE',
      url: route('taskStatus', { id }),
      cookies: cookie,
    });
    expect(authDelete.statusCode).toBe(302);

    const deletedStatus = await findStatusByName(newData.name);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    await knex('task_statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
