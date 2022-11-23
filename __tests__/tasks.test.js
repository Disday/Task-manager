import fastify from 'fastify';
// import { jest } from '@jest/globals';
import init from '../server/plugin.js';
import getUtils from '../utils/utils.js';

let cookie;
const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('test tasks CRUD', () => {
  // jest.setTimeout(30000);
  const {
    _, route, signIn, testData, prepareData, injectGet, getQueryBuilder,
  } = getUtils(app);

  const { knex } = app.objection;
  const existingTask = testData.tasks.existing;
  const newTask = testData.tasks.new;

  beforeAll(async () => {
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

    const { creatorId, statusId } = existingTask;
    const creator = await getQueryBuilder('user').findById(creatorId);
    const status = await getQueryBuilder('status').findById(statusId);
    expect(authResponse.body).toContain(creator.lastName);
    expect(authResponse.body).toContain(creator.firstName);
    expect(authResponse.body).toContain(status.name);

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
    const {
      creatorId, statusId, name, description,
    } = existingTask;
    const { id } = await getQueryBuilder('task').findOne({ name });
    const creator = await getQueryBuilder('user').findById(creatorId);
    const status = await getQueryBuilder('status').findById(statusId);
    const authResponse = await injectGet(['task', { id }], cookie);
    expect(authResponse.statusCode).toBe(200);
    expect(authResponse.body).toContain(creator.lastName);
    expect(authResponse.body).toContain(creator.firstName);
    expect(authResponse.body).toContain(status.name);
    expect(authResponse.body).toContain(description);

    const nonAuthResponse = await injectGet(['task', { id }]);
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('edit', async () => {
    const { name } = existingTask;
    const { id } = await getQueryBuilder('task').findOne({ name });
    const authResponse = await injectGet(['editTask', { id }], cookie);
    expect(authResponse.statusCode).toBe(200);

    const nonAuthResponse = await injectGet(['editTask', { id }]);
    expect(nonAuthResponse.statusCode).toBe(302);

    const nonexistStatusEdit = await injectGet(['editTask', { id: 'nonexstId' }], cookie);
    expect(nonexistStatusEdit.statusCode).toBe(404);
  });

  test('create', async () => {
    const authCreate = await app.inject({
      method: 'POST',
      url: route('tasks'),
      payload: { data: newTask },
      cookies: cookie,
    });
    expect(authCreate.statusCode).toBe(201);

    // const task = await getQueryBuilder('task').findOne({ name: newTask.name });
    const task = await getQueryBuilder('task')
      .findOne({ name: newTask.name })
      .withGraphFetched('labels');
    const newTaskFiltred = _.omit(newTask, 'labelsIds');
    expect(task).toMatchObject(newTaskFiltred);

    const nonAuthCreate = await app.inject({
      method: 'POST',
      url: route('tasks'),
      payload: { data: newTask },
    });
    expect(nonAuthCreate.statusCode).toBe(302);

    const notValidTaskData = { name: '', statusId: '', description: '123' };
    const notValidCreate = await app.inject({
      method: 'POST',
      url: route('tasks'),
      payload: { data: notValidTaskData },
      cookies: cookie,
    });
    expect(notValidCreate.statusCode).toBe(200);

    expect(notValidCreate.body).toContain('invalid-feedback');
  });

  test('patch', async () => {
    const { name } = existingTask;
    const { id } = await getQueryBuilder('task').findOne({ name });
    const authPatch = await app.inject({
      method: 'PATCH',
      url: route('task', { id }),
      payload: { data: newTask },
      cookies: cookie,
    });
    expect(authPatch.statusCode).toBe(200);

    const nonAuthPatch = await app.inject({
      method: 'PATCH',
      url: route('task', { id }),
      payload: { data: { ...newTask, name: 'asdadasd' } },
    });
    expect(nonAuthPatch.statusCode).toBe(302);

    // const nonExistTaskPatch = await app.inject({
    //   method: 'PATCH',
    //   url: route('task', { id: 'nonexistent' }),
    //   payload: { data: newTask },
    //   cookies: cookie
    // });
    // expect(nonExistTaskPatch.statusCode).toBe(404);
  });

  test('delete', async () => {
    const { name } = existingTask;
    const task = await getQueryBuilder('task').findOne({ name });
    const { id } = task;

    const { nonCreator } = testData.users;
    const nonCreatorCookie = await signIn(nonCreator);
    const nonAuthorizedDelete = await app.inject({
      method: 'DELETE',
      url: route('task', { id }),
      cookies: nonCreatorCookie,
    });
    expect(nonAuthorizedDelete.statusCode).toBe(302);

    const existentTask = await getQueryBuilder('task').findOne({ name });
    expect(existentTask).toMatchObject(task);

    const authDelete = await app.inject({
      method: 'DELETE',
      url: route('task', { id }),
      cookies: cookie,
    });
    expect(authDelete.statusCode).toBe(302);

    const deletedTask = await getQueryBuilder('task').findById(id);
    expect(deletedTask).toBeUndefined();
  });

  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
