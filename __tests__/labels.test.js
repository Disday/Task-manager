import fastify from 'fastify';
import { jest } from '@jest/globals';
import init from '../server/plugin.js';
import getUtils from '../utils/utils.js';
// import { jest } from '@jest/globals';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('test labels CRUD', () => {
  jest.setTimeout(30000);
  const {
    t, route, signIn, testData, prepareData, injectGet, getQueryBuilder,
  } = getUtils(app);
  const { knex } = app.objection;
  const findLabelByName = (name) => getQueryBuilder('label').findOne({ name });
  const existingLabel = testData.labels.existing;
  let cookie;

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(knex);
    const existingUser = testData.users.existing;
    cookie = await signIn(existingUser);
  });

  test('index', async () => {
    const authResponse = await injectGet('labels', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('labels');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('new', async () => {
    const authResponse = await injectGet('newlabel', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('newlabel');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('edit', async () => {
    const { id } = await findLabelByName(existingLabel.name);
    const authEdit = await injectGet(['editlabel', { id }], cookie);
    expect(authEdit.statusCode).toBe(200);

    const nonAuthEdit = await injectGet(['editlabel', { id }]);
    expect(nonAuthEdit.statusCode).toBe(302);

    const nonexistLabelEdit = await injectGet(['editlabel', { id: 'nonexistId' }], cookie);
    expect(nonexistLabelEdit.statusCode).toBe(404);
  });

  test('create', async () => {
    const data = { name: 'New label' };
    const authCreate = await app.inject({
      method: 'POST',
      url: route('labels'),
      payload: { data },
      cookies: cookie,
    });
    expect(authCreate.statusCode).toBe(201);

    const label = await findLabelByName(data.name);
    expect(label).toMatchObject(data);

    const nonAuthCreate = await app.inject({
      method: 'POST',
      url: route('labels'),
      payload: { data },
    });
    expect(nonAuthCreate.statusCode).toBe(302);
  });

  test('patch', async () => {
    const { name } = existingLabel;
    const { id } = await findLabelByName(name);
    const data = { name: 'New name' };
    const nonAuthPatch = await app.inject({
      method: 'PATCH',
      url: route('label', { id }),
      payload: { data },
    });
    expect(nonAuthPatch.statusCode).toBe(302);

    const authPatch = await app.inject({
      method: 'PATCH',
      url: route('label', { id }),
      payload: { data },
      cookies: cookie,
    });
    expect(authPatch.statusCode).toBe(200);

    const newlabel = await findLabelByName(data.name);
    expect(newlabel).toMatchObject(data);
  });

  test('delete', async () => {
    const { name } = existingLabel;
    const { id } = await findLabelByName(name);
    const nonAuthDelete = await app.inject({
      method: 'DELETE',
      url: route('label', { id }),
    });
    expect(nonAuthDelete.statusCode).toBe(302);

    const usedLabelId = id;
    const deleteUsedLabel = await app.inject({
      method: 'DELETE',
      url: route('label', { id: usedLabelId }),
      cookies: cookie,
    });
    expect(deleteUsedLabel.statusCode).toBe(200);
    expect(deleteUsedLabel.body).toContain(t('flash.labels.delete.relationError'));

    await getQueryBuilder('label').delete();
    const authDelete = await app.inject({
      method: 'DELETE',
      url: route('label', { id }),
      cookies: cookie,
    });
    expect(authDelete.statusCode).toBe(302);

    const deletedLabel = await findLabelByName(name);
    expect(deletedLabel).toBeUndefined();
  });

  afterEach(async () => {
    await app.objection.knex('labels').truncate();
    await app.objection.knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
