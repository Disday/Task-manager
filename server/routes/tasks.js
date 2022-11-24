import getUtils from '../../utils/utils.js';

export default (app) => {
  const {
    _, redirectGuest, route, t, getModel, getQueryBuilder,
  } = getUtils(app);

  const getNormalizedLabelsIds = (req) => {
    const { labelsIds } = req.body.data;
    const idsArray = _.isArray(labelsIds) ? labelsIds : [labelsIds];
    return idsArray.map((id) => Number(id));
  };

  const getNormalizedRequestData = (req) => {
    const filtredReq = _.omit(req.body.data, 'labelsIds');
    return _.mapValues(filtredReq, (value, key) => {
      if (value === '') {
        return null;
      }
      if (key.includes('Id')) {
        return Number(value);
      }
      return value;
    });
  };

  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      try {
        const tasks = await getQueryBuilder('task');
        const statuses = await getQueryBuilder('status');
        const users = await getQueryBuilder('user');
        reply.render('tasks/index', { tasks, statuses, users });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const task = new (getModel('task'))();
      try {
        const statuses = await getQueryBuilder('status');
        const labels = await getQueryBuilder('label');
        const users = await getQueryBuilder('user');
        reply.render('tasks/new', {
          task, statuses, labels, users,
        });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .get('/tasks/:id', { name: 'task' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      // const id = String(req.params.id);
      try {
        const task = await getQueryBuilder('task').findById(id);
        // const statuses = await getModel('status').query();
        const status = await task.$relatedQuery('status').for(id);
        const labels = await task.$relatedQuery('labels').for(id);
        const creator = await task.$relatedQuery('creator').for(id);
        const executor = await task.$relatedQuery('executor').for(id);
        reply.render('tasks/task', {
          task, status, labels, creator, executor,
        });
      } catch (e) {
        console.log(e);
        reply.code(404).render('errors/404');
      }
    })
    .get('/tasks/:id/edit', { name: 'editTask' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      try {
        const statuses = await getQueryBuilder('status');
        const labels = await getQueryBuilder('label');
        const users = await getQueryBuilder('user');
        const task = await getQueryBuilder('task')
          .findOne({ id })
          .withGraphFetched('labels');
        task.labelsIds = task.labels.map((label) => String(label.id));

        if (!task) {
          throw new Error();
        }
        reply.render('tasks/edit', {
          task, statuses, labels, users,
        });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .post('/tasks', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const statuses = await getQueryBuilder('status');
      const labels = await getQueryBuilder('label');
      const users = await getQueryBuilder('user');

      const creatorId = req.user.id;
      const normalizedData = getNormalizedRequestData(req);
      const labelsIds = getNormalizedLabelsIds(req);
      const taskLabels = labelsIds.map((id) => ({ id }));
      const data = { ...normalizedData, creatorId, labels: taskLabels };

      const TaskModel = getModel('task');
      const task = new TaskModel();
      task.$set(data);
      try {
        await TaskModel.transaction(async (trx) => {
          // pretty insert using graph method like MongoDB,
          // insertGraph is not atomiс operation so we need transaction
          await TaskModel.query(trx).insertGraph(data, { relate: true });
          // return;
        });
        req.flash('info', t('flash.tasks.create.success'));
        reply.code(201).render('tasks/new', {
          task, statuses, labels, users,
        });
      } catch (e) {
        console.log(e);
        req.flash('error', t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task, statuses, labels, users, errors: e.data,
        });
      }
    })
    .patch('/tasks/:id', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const statuses = await getQueryBuilder('status');
      const labels = await getQueryBuilder('label');
      const users = await getQueryBuilder('user');
      const { id } = req.params;
      const task = await getQueryBuilder('task').findById(id);

      const normalizedData = getNormalizedRequestData(req);
      const data = { ...task, ...normalizedData };
      const labelsIds = getNormalizedLabelsIds(req);
      const taskModel = getModel('task');
      task.$set(req.body.data);
      try {
        const validTask = await taskModel.fromJson(data);
        await taskModel.transaction(async (trx) => {
          await task.$query(trx).patch(validTask);
          await task.$relatedQuery('labels', trx).unrelate();
          // we use loop beacause SQLite in dev environment doest support batch opertaions
          await Promise.all(
            labelsIds.map(
              (labelId) => task.$relatedQuery('labels', trx).relate(labelId),
            ),
          );
        });
        req.flash('info', t('flash.tasks.update.success'));
        reply.render('tasks/edit', {
          task, statuses, labels, users,
        });
        return reply;
      } catch (e) {
        console.log(e);
        req.flash('error', t('flash.tasks.update.error'));
        reply.render('tasks/edit', {
          task, labels, statuses, users, errors: e.data,
        });
        return reply;
      }
    })
    .delete('/tasks/:id', async (req, reply) => {
      try {
        const { id } = req.params;
        const task = await getQueryBuilder('task').findById(id);
        const isCurrentUserTaskCreator = req.user.id === task.creatorId;
        if (!isCurrentUserTaskCreator) {
          req.flash('error', t('flash.authError'));
          reply.redirect(route('root'));
          return;
        }
        const deletedRowsCount = await getQueryBuilder('task').deleteById(id);
        if (!deletedRowsCount) {
          throw Error();
        }
        req.flash('info', t('flash.tasks.delete.success'));
        reply.redirect(route('tasks'));
      } catch (e) {
        req.flash('error', t('flash.tasks.delete.error'));
        reply.redirect(route('tasks'));
      }
    });
};
