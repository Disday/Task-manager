// @ts-check

import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import fixtures from 'simple-knex-fixtures';

// TODO: использовать для фикстур https://github.com/viglucci/simple-knex-fixtures
const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export default (app) => ({
  getTestData: () => getFixtureData('testData.json'),
  prepareData: async () => await fixtures.loadFile('__fixtures__/users.json', app.objection.knex),

  createStatus: async (data, cookie) => {
    return await app.inject({
      method: 'POST',
      url: app.reverse('taskStatuses'),
      payload: { data },
      cookies: cookie
    });
  },

  signIn: async (userParams) => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: userParams,
      },
    });
    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    const cookie = { [name]: value };
    return cookie;
  },
});
// await fixtures.loadFiles("fixtures/*.json", connection)
// await fixtures.loadFiles([
//   "fixtures/file1.json",
//   "fixtures/file2.json",
// ], connection);

