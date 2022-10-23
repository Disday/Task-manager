import fastify from 'fastify';
import init from '../server/plugin.js';
import getUtils from '../utils/utils.js';
// import { jest } from '@jest/globals';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));


describe('test taskStatuses CRUD', () => {
  // jest.setTimeout(30000)
  const { route, signIn, testData, prepareData, injectGet, getQueryBuilder } = getUtils(app);
  const { knex } = app.objection;
  const findStatusByName = (name) => getQueryBuilder('taskStatus').findOne({ name });
  const existingStatus = testData.taskStatuses.existing;
  let cookie;

  beforeAll(async () => {
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(knex);
    const existingUser = testData.users.existing;
    cookie = await signIn(existingUser);
  });

  test('index', async () => {
    const authResponse = await injectGet('taskStatuses', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('taskStatuses');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('new', async () => {
    const authResponse = await injectGet('newTaskStatus', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('newTaskStatus');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('editStatus', async () => {
    const { id } = await findStatusByName(existingStatus.name);
    const authEdit = await injectGet(['editTaskStatus', { id }], cookie);
    expect(authEdit.statusCode).toBe(200);

    const nonAuthEdit = await injectGet(['editTaskStatus', { id }]);
    expect(nonAuthEdit.statusCode).toBe(302);

    const nonexistStatusEdit = await injectGet(['editTaskStatus', { id: 'nonexistId' }], cookie);
    expect(nonexistStatusEdit.statusCode).toBe(404);
  });

  test('create', async () => {
    const data = { name: 'New status' };
    const authCreate = await app.inject({
      method: 'POST',
      url: route('taskStatuses'),
      payload: { data },
      cookies: cookie,
    });
    expect(authCreate.statusCode).toBe(201);

    const status = await findStatusByName(data.name);
    expect(status).toMatchObject(data);

    const nonAuthCreate = await app.inject({
      method: 'POST',
      url: route('taskStatuses'),
      payload: { data },
    });
    expect(nonAuthCreate.statusCode).toBe(302);
  });

  test('patch', async () => {
    const { name } = existingStatus;
    const { id } = await findStatusByName(name);
    const data = { name: 'New name' };
    const nonAuthPatch = await app.inject({
      method: 'PATCH',
      url: route('taskStatus', { id }),
      payload: { data },
    });
    expect(nonAuthPatch.statusCode).toBe(302);

    const authPatch = await app.inject({
      method: 'PATCH',
      url: route('taskStatus', { id }),
      payload: { data },
      cookies: cookie,
    });
    expect(authPatch.statusCode).toBe(200);

    const newStatus = await findStatusByName(data.name);
    expect(newStatus).toMatchObject(data);
  });

  test('delete', async () => {
    const { name } = existingStatus;
    const { id } = await findStatusByName(name);
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

    const deletedStatus = await findStatusByName(name);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    await app.objection.knex('task_statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
