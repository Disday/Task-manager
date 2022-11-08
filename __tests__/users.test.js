import fastify from 'fastify';
import omit from 'lodash/omit.js';
import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import getUtils from '../utils/utils.js';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('test users CRUD', () => {
  const {
    t, route, signIn, testData, prepareData, injectGet, getQueryBuilder,
  } = getUtils(app);
  const { knex } = app.objection;
  const findUserByEmail = (email) => getQueryBuilder('user').findOne({ email });
  const existingUser = testData.users.existing;
  let cookie;

  beforeAll(async () => {
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(knex);
    cookie = await signIn(existingUser);
  });

  test('index', async () => {
    const response = await injectGet('users');
    expect(response.statusCode).toBe(200);
  });

  test('new', async () => {
    const response = await injectGet('newUser');
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
    const user = await findUserByEmail(params.email);
    expect(user).toMatchObject(expected);
  });

  test('edit', async () => {
    const { id } = await findUserByEmail(existingUser.email);
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
    const { id } = await findUserByEmail(existingUser.email);
    const nonAuthorized = await app.inject({
      method: 'PATCH',
      url: route('user', { id }),
    });
    expect(nonAuthorized.statusCode).toBe(302);

    const data = { ...existingUser, firstName: 'Vasya' };
    const authorized = await app.inject({
      method: 'PATCH',
      url: route('user', { id }),
      cookies: cookie,
      payload: {
        data,
      },
    });
    expect(authorized.statusCode).toBe(200);

    const { firstName } = await findUserByEmail(existingUser.email);
    expect(firstName).toEqual(data.firstName);
  });

  test('delete', async () => {
    const { id } = await findUserByEmail(existingUser.email);
    const nonAuthorizedDelete = await app.inject({
      method: 'DELETE',
      url: route('user', { id }),
    });
    expect(nonAuthorizedDelete.statusCode).toBe(302);
    const user = await findUserByEmail(existingUser.email);
    expect(user).toBeDefined();

    const involvedUserId = id;
    const deleteInvolvedUser = await app.inject({
      method: 'DELETE',
      url: route('user', { id: involvedUserId }),
      cookies: cookie,
    });

    expect(deleteInvolvedUser.statusCode).toBe(200);
    expect(deleteInvolvedUser.body).toContain(t('flash.users.delete.relationError'));

    await getQueryBuilder('task').delete();
    const authorizedDeleteUser = await app.inject({
      method: 'DELETE',
      url: route('user', { id }),
      cookies: cookie,
    });
    expect(authorizedDeleteUser.statusCode).toBe(302);

    const deletedUser = await findUserByEmail(existingUser.email);
    expect(deletedUser).toBeUndefined();
  });

  afterEach(async () => {
    await app.objection.knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
