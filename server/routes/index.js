// @ts-check

import welcome from './welcome.js';
import users from './users.js';
import session from './session.js';
import statuses from './statuses.js';
import labels from './labels.js';
import tasks from './tasks.js';

const controllers = [
  welcome,
  users,
  session,
  statuses,
  labels,
  tasks,
];

export default (app) => controllers.forEach((f) => f(app));
