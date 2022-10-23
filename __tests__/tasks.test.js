import fastify from 'fastify';
import init from '../server/plugin.js';
import getUtils from '../utils/utils.js';
import { jest } from '@jest/globals';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('test tasks CRUD', () => {
  jest.setTimeout(30000)
  const { route, signIn, testData, prepareData, injectGet, getQueryBuilder } = getUtils(app);

  const knex = app.objection.knex;
  const existingTask = testData.tasks.existing;
  const newTask = testData.tasks.new;
  let cookie;

  beforeAll(async () => {
    // findStatusByName = (name) => app.objection.models.taskStatus.query().findOne({ name });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(knex);
    const existingUser = testData.users.existing;
    cookie = await signIn(existingUser);
  });

  test('index', async () => {
    const authResponse = await injectGet('tasks', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('tasks');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('new', async () => {
    const authResponse = await injectGet('newTask', cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('newTask');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('task', async () => {
    const { name } = existingTask;
    const { id } = await getQueryBuilder('task').findOne({ name });
    const authResponse = await injectGet(['task', { id }], cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet(['task', { id }]);
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('edit', async () => {
    const { name } = existingTask;
    const { id } = await getQueryBuilder('task').findOne({ name });
    const authResponse = await injectGet(['editTask', { id }], cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet('editTask');
    expect(nonAuthResponse.statusCode).toBe(302);

    const nonexistStatusEdit = await injectGet(['editTask', { id: 'nonexstId' }], cookie);
    expect(nonexistStatusEdit.statusCode).toBe(404);
  });

  test('create', async () => {
    // const newTask = testData.tasks.new;
    const authCreate = await app.inject({
      method: 'POST',
      url: route('tasks'),
      payload: { data: newTask },
      cookies: cookie,
    });
    expect(authCreate.statusCode).toBe(201);

    const task = await getQueryBuilder('task').findOne({ name: newTask.name });
    expect(task).toMatch(newTask);

    const nonAuthCreate = await app.inject({
      method: 'POST',
      url: route('tasks'),
      payload: { data: newTask },
    });
    expect(nonAuthCreate.statusCode).toBe(302);
  });

  test('patch', async () => {
    const { name } = existingTask;
    const { id } = await getQueryBuilder('task').findOne({ name });
    // const newTask = testData.tasks.new;
    const authPatch = await app.inject({
      method: 'PATCH',
      url: route('tasks', { id }),
      payload: { data: newTask },
      cookies: cookie,
    });
    expect(authPatch.statusCode).toBe(200);

    const nonAuthPatch = await app.inject({
      method: 'PATCH',
      url: route('tasks', { id }),
      payload: { data: newTask },
    });
    expect(nonAuthPatch.statusCode).toBe(302);

    const nonExistTaskPatch = await app.inject({
      method: 'PATCH',
      url: route('tasks', { id: 'nonexistent' }),
      payload: { data: newTask },
      cookies: cookie
    });
    expect(nonExistTaskPatch.statusCode).toBe(404);
  });

  test('delete', async () => {
    const { name, creatorId } = existingTask;
    const task = await getQueryBuilder('task').findOne({ name });
    const nonAuthDelete = await app.inject({
      method: 'DELETE',
      url: route('tasks', { id: task.id }),
      cookies: cookie,
    });
    expect(nonAuthDelete.statusCode).toBe(302);

    const existentTask = await getQueryBuilder('task').findOne({ name });
    expected(existentTask).toMatch(task);

    await app.inject({
      method: 'DELETE',
      url: route('session'),
      cookies: cookie,
    });

    const creator = await getQueryBuilder('user').findOne({ id: creatorId });
    const creatorCookie = await signIn(creator);

    const authPatch = await app.inject({
      method: 'DELETE',
      url: route('tasks', { taskId }),
      cookies: creatorCookie,
    });
    expect(authPatch.statusCode).toBe(302);

    const deletedTask = await getQueryBuilder('task').findOne({ name });
    expected(deletedTask).toBeUndefined();
  });

  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});