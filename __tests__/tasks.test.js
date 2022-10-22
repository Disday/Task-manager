import fastify from 'fastify';
import init from '../server/plugin.js';
import getUtils from '../utils/utils.js';
// import { jest } from '@jest/globals';

const app = await init(fastify({
  // logger: { prettyPrint: false }
}));

describe('test tasks CRUD', () => {
  // jest.setTimeout(30000)
  const { route, signIn, testData, prepareData, injectGet } = getUtils(app);
  const knex = app.objection.knex;
  const existingTask = testData.tasks.existing;
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
    expect(authResponse.body).toContain('Создание');
    console.log(authResponse.body);

    const nonAuthResponse = await injectGet('newTask');
    expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('edit', async () => {
    // existingTa
    // const authResponse = await injectGet(['editTask', { id:}], cookie);
    // expect(authResponse.statusCode).toBe(200);

    // const nonAuthResponse = await injectGet('editTask');
    // expect(nonAuthResponse.statusCode).toBe(302);
  });

  test('create', async () => {

  });


  afterEach(async () => {
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});