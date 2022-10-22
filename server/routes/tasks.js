import getUtils from '../../utils/utils.js';

export default (app) => {
  const { redirectGuest, route, t, _, getModel, getQueryBuilder } = getUtils(app);

  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      redirectGuest(req, reply);
      const tasks = await getQueryBuilder('task');
      reply.render('tasks/index', { tasks });
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      redirectGuest(req, reply);
      try {
        const task = new (getModel('task'));
        const statuses = await getQueryBuilder('taskStatus');
        const users = await getQueryBuilder('user');
        reply.render('tasks/new', { task, statuses, users });
      } catch (e) {

      }
    })
    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      redirectGuest(req, reply);
      const { id } = req.params;
      try {
        const task = getQueryBuilder('task').findOne({ id });
        if (!task) {
          throw new Error();
        }
        reply.render('tasks/new', { task });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    });
};