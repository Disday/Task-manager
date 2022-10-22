import getUtils from '../../utils/utils.js';

export default (app) => {
  const { redirectGuest, route, t, _, getModel, getQueryBuilder } = getUtils(app);

  app
    .get('/statuses', { name: 'taskStatuses' }, async (req, reply) => {
      redirectGuest(req, reply);
      const statuses = await getQueryBuilder('taskStatus');
      reply.render('taskStatuses/index', { statuses });
    })
    .get('/statuses/new', { name: 'newTaskStatus' }, async (req, reply) => {
      redirectGuest(req, reply);
      const status = new (getModel('taskStatus'));
      reply.render('taskStatuses/new', { status });
    })
    .get('/statuses/:id/edit', { name: 'editTaskStatus' }, async (req, reply) => {
      redirectGuest(req, reply);
      const { id } = req.params;
      try {
        const status = await getQueryBuilder('taskStatus').findOne({ id });
        if (!status) {
          throw new Error();
        }
        reply.render('taskStatuses/edit', { status });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .post('/statuses', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { data } = req.body;
      const status = new (getModel('taskStatus'));
      try {
        const validstatus = await getModel('taskStatus').fromJson(data);
        await getQueryBuilder('taskStatus').insert(validstatus);
        req.flash('info', t('flash.taskStatuses.create.success'));
        reply.code(201).render('taskStatuses/new', { status });
      } catch (e) {
        req.flash('error', t('flash.taskStatuses.create.error'));
        reply.render('taskStatuses/new', { status, errors: e.data });
      }
    })
    .patch('/statuses/:id', { name: 'taskStatus' }, async (req, reply) => {
      redirectGuest(req, reply);
      const { id } = req.params;
      const status = await getQueryBuilder('taskStatus').findOne({ id });
      if (!status) {
        reply.code(404).render('errors/404');
      }
      try {
        const { data } = req.body;
        const validstatus = await getModel('taskStatus').fromJson(data);
        await status.$query().patch(validstatus);
        req.flash('info', t('flash.taskStatuses.update.success'));
        reply.render('taskStatuses/edit', { status });
        return reply;
      } catch (e) {
        req.flash('error', t('flash.taskStatuses.update.error'));
        reply.render('taskStatus/edit', { status, errors: e.data });
      }
    })
    .delete('/statuses/:id', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      try {
        const deletedRowsCount = await getQueryBuilder('taskStatus').deleteById(id);
        if (!deletedRowsCount) {
          reply.code(404).render('errors/404');
          return reply;
        }
        req.flash('info', t('flash.taskStatuses.delete.success'));
        reply.redirect(route('taskStatuses'));
      } catch (e) {
        req.flash('error', t('flash.taskStatuses.delete.error'));
        reply.redirect(route('taskStatuses'));
      }
    })
};