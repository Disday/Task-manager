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
        reply.code(404).render('errors/404');
      }
    })
    .get('/tasks/:id', { name: 'task' }, async (req, reply) => {
      redirectGuest(req, reply);
      try {
        const { id } = req.params;
        const task = await getQueryBuilder('task').findOne({ id });
        reply.render('tasks/task', { task });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      redirectGuest(req, reply);
      const { id } = req.params;
      try {
        // const task = new (getModel('task'));
        const statuses = await getQueryBuilder('taskStatus');
        const users = await getQueryBuilder('user');
        const task = await getQueryBuilder('task').findOne({ id });
        if (!task) {
          throw new Error();
        }
        reply.render('tasks/edit', { task, statuses, users });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .post('/tasks', async (req, reply) => {
      redirectGuest(req, reply);
      const creatorId = String(req.user.id);
      const data = { ...req.body.data, creatorId };
      const task = new (getModel('task'));
      task.$set(data);
      const statuses = await getQueryBuilder('taskStatus');
      const users = await getQueryBuilder('user');
      try {
        const validTask = await getModel('task').fromJson(data);
        await getQueryBuilder('task').insert(validTask);
        req.flash('info', t('flash.tasks.create.success'));
        reply.code(201).render('tasks/new', { task, statuses, users });
      } catch (e) {
        req.flash('error', t('flash.tasks.create.error'));
        reply.render('tasks/new', { task, statuses, users, errors: e.data });
      }
    })
};