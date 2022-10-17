// @ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => ({
  _,
  route: (name, params) => app.reverse(name, params),
  t: (key) => i18next.t(key),
  getModel: (modelName) => app.objection.models[modelName],
  isAuthorized: (req) => req.isAuthenticated() && Number(req.params.id) === req.user.id,
  formatDate: (str) => (new Date(str)).toLocaleString(),
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
});
