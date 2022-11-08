import getUtils from '../../utils/utils.js';

export default (app) => {
  const {
    redirectGuest, route, t, _, getModel, getQueryBuilder,
  } = getUtils(app);

  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const labels = await getQueryBuilder('label');
      reply.render('labels/index', { labels });
    })
    .get('/labels/new', { name: 'newlabel' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const label = new (getModel('label'))();
      reply.render('labels/new', { label });
    })
    .get('/labels/:id/edit', { name: 'editlabel' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      try {
        const label = await getQueryBuilder('label').findOne({ id });
        if (!label) {
          throw new Error();
        }
        reply.render('labels/edit', { label });
      } catch (e) {
        reply.code(404).render('errors/404');
      }
    })
    .post('/labels', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { data } = req.body;
      const label = new (getModel('label'))();
      try {
        const validlabel = await getModel('label').fromJson(data);
        await getQueryBuilder('label').insert(validlabel);
        req.flash('info', t('flash.labels.create.success'));
        reply.code(201).render('labels/new', { label });
      } catch (e) {
        req.flash('error', t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: e.data });
      }
    })
    .patch('/labels/:id', { name: 'label' }, async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      const label = await getQueryBuilder('label').findOne({ id });
      if (!label) {
        reply.code(404).render('errors/404');
      }
      try {
        const { data } = req.body;
        const validlabel = await getModel('label').fromJson(data);
        await label.$query().patch(validlabel);
        req.flash('info', t('flash.labels.update.success'));
        reply.render('labels/edit', { label });
        return reply;
      } catch (e) {
        req.flash('error', t('flash.labels.update.error'));
        reply.render('label/edit', { label, errors: e.data });
        // return reply;
      }
    })
    .delete('/labels/:id', async (req, reply) => {
      if (redirectGuest(req, reply)) {
        return;
      }
      const { id } = req.params;
      const taskModel = getModel('task');
      try {
        const q = await taskModel.query();
        const tasksWithlabel = await taskModel
          .relatedQuery('labels')
          .for(q)
          .where('labels.id', id);

        const isLabelUsed = !_.isEmpty(tasksWithlabel);
        if (isLabelUsed) {
          req.flash('error', t('flash.labels.delete.relationError'));
          const labels = await getQueryBuilder('label');
          reply.render('labels/index', { labels });
          return reply;
        }
        const deletedRowsCount = await getQueryBuilder('label').deleteById(id);
        if (!deletedRowsCount) {
          // reply.code(404).render('errors/404');
          throw Error();
        }
        req.flash('info', t('flash.labels.delete.success'));
        reply.redirect(route('labels'));
      } catch (e) {
        req.flash('error', t('flash.labels.delete.error'));
        reply.redirect(route('labels'));
      }
    });
};
