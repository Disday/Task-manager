import getUtils from '../../utilities/index.js';

export default (app) => {
  const { redirectGuest, route, t, _, getModel, getQueryBuilder } = getUtils(app);

  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      redirectGuest(req, reply);
      const tasks = getModel('tasks').query();
      reply.render('tasks/index', { tasks });
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      // const tasks = {};
      // reply.render('tasks/index', tasks);
    })
};