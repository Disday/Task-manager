// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData, signIn } from './helpers/index.js';

describe('test users CRUD', () => {
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

  test('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });
    expect(response.statusCode).toBe(200);
  });

  test('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  test('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: 'users',
      payload: {
        data: params,
      },
    });
    expect(response.statusCode).toBe(302);

    const expected = {
      ...(_.omit(params, 'password')),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  test('edit', async () => {
    const userParams = testData.users.existing;
    const cookie = await signIn(app, userParams);
    const { id } = await models.user.query().findOne({ email: userParams.email });
    const authorized = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id }),
      cookies: cookie,
    });
    expect(authorized.statusCode).toBe(200);

    const nonAuthorized = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id }),
    });
    expect(nonAuthorized.statusCode).toBe(302);
  });

  test('patch', async () => {
    const userParams = testData.users.existing;
    const { id } = await models.user.query().findOne({ email: userParams.email });
    const nonAuthorized = await app.inject({
      method: 'PATCH',
      url: app.reverse('patchUser', { id }),
    });
    expect(nonAuthorized.statusCode).toBe(302);

    const cookie = await signIn(app, userParams);
    const data = { ...testData.users.existing, firstName: 'Vasya' };
    const authorized = await app.inject({
      method: 'PATCH',
      url: app.reverse('patchUser', { id }),
      cookies: cookie,
      payload: {
        data,
      },
    });
    expect(authorized.statusCode).toBe(200);

    const { firstName } = await models.user.query().findOne({ email: userParams.email });
    expect(firstName).toEqual(data.firstName);
  });

  test('delete', async () => {
    const userParams = testData.users.existing;
    const { id } = await models.user.query().findOne({ email: userParams.email });
    const nonAuthorized = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id }),
    });
    expect(nonAuthorized.statusCode).toBe(302);
    const user = await models.user.query().findOne({ email: userParams.email });
    expect(user).toBeDefined();

    const cookie = await signIn(app, userParams);
    const authorized = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id }),
      cookies: cookie,
    });
    expect(authorized.statusCode).toBe(302);

    const deletedUser = await models.user.query().findOne({ email: userParams.email });
    expect(deletedUser).toBeUndefined();
  });

  afterEach(async () => {
    await knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
