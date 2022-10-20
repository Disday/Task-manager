// @ts-check

import fastify from 'fastify';
import omit from 'lodash/omit.js';
import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import getUtils from './helpers/index.js';

//TODO Refactor

describe('test users CRUD', () => {
  let app, knex, route, findUserByEmail, prepareData, getTestData, testData, signIn;

  beforeAll(async () => {
    app = fastify({
      // logger: { prettyPrint: false }
    });
    await init(app);
    findUserByEmail = (email) => app.objection.models.user.query().findOne({ email });
    ({ prepareData, getTestData, signIn } = getUtils(app));
    testData = getTestData();
    route = app.reverse;
    knex = app.objection.knex;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData();
  });

  test('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: route('users'),
    });
    expect(response.statusCode).toBe(200);
  });

  test('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: route('newUser'),
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
      ...(omit(params, 'password')),
      passwordDigest: encrypt(params.password),
    };
    const user = await findUserByEmail(params.email)
    expect(user).toMatchObject(expected);
  });

  test('edit', async () => {
    const userParams = testData.users.existing;
    const cookie = await signIn(userParams);
    const { id } = await findUserByEmail(userParams.email);
    const authorized = await app.inject({
      method: 'GET',
      url: route('editUser', { id }),
      cookies: cookie,
    });
    expect(authorized.statusCode).toBe(200);

    const nonAuthorized = await app.inject({
      method: 'GET',
      url: route('editUser', { id }),
    });
    expect(nonAuthorized.statusCode).toBe(302);
  });

  test('patch', async () => {
    const userParams = testData.users.existing;
    const { id } = await findUserByEmail(userParams.email);
    const nonAuthorized = await app.inject({
      method: 'PATCH',
      url: route('user', { id }),
    });
    expect(nonAuthorized.statusCode).toBe(302);

    const cookie = await signIn( userParams);
    const data = { ...testData.users.existing, firstName: 'Vasya' };
    const authorized = await app.inject({
      method: 'PATCH',
      url: route('user', { id }),
      cookies: cookie,
      payload: {
        data,
      },
    });
    expect(authorized.statusCode).toBe(200);

    const { firstName } = await findUserByEmail(userParams.email);
    expect(firstName).toEqual(data.firstName);
  });

  test('delete', async () => {
    const userParams = testData.users.existing;
    const { id } = await findUserByEmail(userParams.email);
    const nonAuthorized = await app.inject({
      method: 'DELETE',
      url: route('user', { id }),
    });
    expect(nonAuthorized.statusCode).toBe(302);
    const user = await findUserByEmail(userParams.email);
    expect(user).toBeDefined();

    const cookie = await signIn(userParams);
    const authorized = await app.inject({
      method: 'DELETE',
      url: route('user', { id }),
      cookies: cookie,
    });
    expect(authorized.statusCode).toBe(302);

    const deletedUser = await findUserByEmail(userParams.email);
    expect(deletedUser).toBeUndefined();
  });

  afterEach(async () => {
    await knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
