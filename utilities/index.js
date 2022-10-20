// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  const utils = {
    _,
    route: (name, params) => app.reverse(name, params),
    t: (key) => i18next.t(key),
    getModel: (modelName) => app.objection.models[modelName],
    getQueryBuilder: (modelName) => utils.getModel(modelName).query(),
    isAuthorized: (req) => req.isAuthenticated() && Number(req.params.id) === req.user.id,
    formatDate: (str) => (new Date(str)).toLocaleString(),

    redirectGuest: (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', utils.t('flash.authError'))
        reply.redirect(app.reverse('root'));
        return true;
      }
      return false;
    },

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
  };

  return utils;
};
