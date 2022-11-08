import getUtils from '../../utils/utils.js';

export default (app) => {
  const {
    redirectGuest, route, t, _, getModel, getQueryBuilder,
  } = getUtils(app);

  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const statuses = await getQueryBuilder('status');
      reply.render('statuses/index', { statuses });
    })
    .get('/statuses/new', { name: 'newstatus' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const status = new (getModel('status'))();
      reply.render('statuses/new', { status });
    })
    .get('/statuses/:id/edit', { name: 'editstatus' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      try {
        const status = await getQueryBuilder('status').findOne({ id });
        if (!status) {
          throw new Error();
        }
        reply.render('statuses/edit', { status });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .post('/statuses', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { data } = req.body;
      const status = new (getModel('status'))();
      try {
        const validstatus = await getModel('status').fromJson(data);
        await getQueryBuilder('status').insert(validstatus);
        req.flash('info', t('flash.statuses.create.success'));
        reply.code(201).render('statuses/new', { status });
      } catch (e) {
        req.flash('error', t('flash.statuses.create.error'));
        reply.render('statuses/new', { status, errors: e.data });
      }
    })
    .patch('/statuses/:id', { name: 'status' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      const status = await getQueryBuilder('status').findOne({ id });
      if (!status) {
        reply.code(404).render('errors/404');
      }
      try {
        const { data } = req.body;
        const validstatus = await getModel('status').fromJson(data);
        await status.$query().patch(validstatus);
        req.flash('info', t('flash.statuses.update.success'));
        reply.render('statuses/edit', { status });
        return reply;
      } catch (e) {
        req.flash('error', t('flash.statuses.update.error'));
        reply.render('status/edit', { status, errors: e.data });
        // return reply;
      }
    })
    .delete('/statuses/:id', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;

      const tasksWithStatus = await getQueryBuilder('task')
        .where('statusId', id);
      const isStatusUsed = !_.isEmpty(tasksWithStatus);

      if (isStatusUsed) {
        req.flash('error', t('flash.statuses.delete.relationError'));
        const statuses = await getQueryBuilder('status');
        reply.render('statuses/index', { statuses });
        return reply;
      }
      try {
        const deletedRowsCount = await getQueryBuilder('status').deleteById(id);
        if (!deletedRowsCount) {
          // reply.code(404).render('errors/404');
          throw Error();
        }
        req.flash('info', t('flash.statuses.delete.success'));
        reply.redirect(route('statuses'));
      } catch (e) {
        req.flash('error', t('flash.statuses.delete.error'));
        reply.redirect(route('statuses'));
      }
    });
};
