// @ts-check

import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import fixtures from 'simple-knex-fixtures';

// TODO: использовать для фикстур https://github.com/viglucci/simple-knex-fixtures
const getFixturePath = (filename) => path.join('..', '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim();
const getFixtureData = (filename) => JSON.parse(readFixture(filename));

export const getTestData = () => getFixtureData('testData.json');

export const prepareData = async (app) => {
  const { knex } = app.objection;
  // получаем данные из фикстур и заполняем БД
  // await knex('users').insert(getFixtureData('users.json'));
  // console.log(process.cwd());
  await fixtures.loadFile('__fixtures__/users.json', knex);
};

// await fixtures.loadFiles("fixtures/*.json", connection)

// await fixtures.loadFiles([
//   "fixtures/file1.json",
//   "fixtures/file2.json",
// ], connection);

export const signIn = async (app, userParams) => {
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
};
