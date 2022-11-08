import fastify from 'fastify';
import init from '../server/plugin.js';
import getUtils from '../utils/utils.js';
// import { jest } from '@jest/globals';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('test statuses CRUD', () => {
  // jest.setTimeout(30000)
  const {
    t, route, signIn, testData, prepareData, injectGet, getQueryBuilder,
  } = getUtils(app);
  const { knex } = app.objection;
  const findStatusByName = (name) => getQueryBuilder('status').findOne({ name });
  const existingStatus = testData.statuses.existing;
  let cookie;

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(knex);
    const existingUser = testData.users.existing;
    cookie = await signIn(existingUser);
  });

  test('index', async () => {
    const authResponse = await injectGet('statuses', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('statuses');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('new', async () => {
    const authResponse = await injectGet('newstatus', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('newstatus');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('editStatus', async () => {
    const { id } = await findStatusByName(existingStatus.name);
    const authEdit = await injectGet(['editstatus', { id }], cookie);
    expect(authEdit.statusCode).toBe(200);

    const nonAuthEdit = await injectGet(['editstatus', { id }]);
    expect(nonAuthEdit.statusCode).toBe(302);

    const nonexistStatusEdit = await injectGet(['editstatus', { id: 'nonexistId' }], cookie);
    expect(nonexistStatusEdit.statusCode).toBe(404);
  });

  test('create', async () => {
    const data = { name: 'New status' };
    const authCreate = await app.inject({
      method: 'POST',
      url: route('statuses'),
      payload: { data },
      cookies: cookie,
    });
    expect(authCreate.statusCode).toBe(201);

    const status = await findStatusByName(data.name);
    expect(status).toMatchObject(data);

    const nonAuthCreate = await app.inject({
      method: 'POST',
      url: route('statuses'),
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
      url: route('status', { id }),
      payload: { data },
    });
    expect(nonAuthPatch.statusCode).toBe(302);

    const authPatch = await app.inject({
      method: 'PATCH',
      url: route('status', { id }),
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
      url: route('status', { id }),
    });
    expect(nonAuthDelete.statusCode).toBe(302);

    const usedStatusId = id;
    const deleteUsedStatus = await app.inject({
      method: 'DELETE',
      url: route('status', { id: usedStatusId }),
      cookies: cookie,
    });
    expect(deleteUsedStatus.statusCode).toBe(200);
    expect(deleteUsedStatus.body).toContain(t('flash.statuses.delete.relationError'));

    await getQueryBuilder('task').delete();
    const authDelete = await app.inject({
      method: 'DELETE',
      url: route('status', { id }),
      cookies: cookie,
    });
    expect(authDelete.statusCode).toBe(302);

    const deletedStatus = await findStatusByName(name);
    expect(deletedStatus).toBeUndefined();
  });

  afterEach(async () => {
    await app.objection.knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
