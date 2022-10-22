import i18next from 'i18next';
import _ from 'lodash';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import fixtures from 'simple-knex-fixtures';

const fixturePaths = [
  "__fixtures__/users.json",
  "__fixtures__/taskStatuses.json",
];

export default (app) => {
  const utils = {
    route: (...args) => app.reverse(...args),
    // route: app.reverse,
    // knex: app.objection.knex,
    getModel: (modelName) => app.objection.models[modelName],
    getQueryBuilder: (modelName) => utils.getModel(modelName).query(),
    prepareData: async (knex) => await fixtures.loadFiles(fixturePaths, knex),
    _,
    t: (key) => i18next.t(key),
    isAuthorized: (req) => req.isAuthenticated() && Number(req.params.id) === req.user.id,
    formatDate: (str) => (new Date(str)).toLocaleString(),

    injectGet: async (pathParams, cookie) => {
      const { route } = utils;
      const url = _.isArray(pathParams) ? route(...pathParams) : route(pathParams);
      const params = { method: 'GET', url };
      const payload = cookie ? { ...params, cookies: cookie } : params;
      return await app.inject(payload);
    },

    redirectGuest: (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', utils.t('flash.authError'))
        reply.redirect(utils.route('root'));
        return true;
      }
      return false;
    },

    testData: (() => {
      const getFixturePath = (filename) => path.join('..', '__fixtures__', filename);
      const readFixture = (filename) => fs.readFileSync(new URL(getFixturePath(filename), import.meta.url), 'utf-8').trim();
      return JSON.parse(readFixture('testData.json'));
    })(),

    getAlertClass: (type) => {
      const map = {
        error: 'danger',
        success: 'success',
        info: 'info',
      };
      if (map[type]) {
        return map[type];
      }
      throw new Error(`Unknown flash type: '${type}'`);
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
  };
  return utils;
};
