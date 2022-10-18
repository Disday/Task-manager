import getUtils from '../../utilities/index.js';

export default (app) => {
  const {redirectGuest, route, t, _, getModel, getQueryBuilder } = getUtils(app);

  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      redirectGuest(req, reply);
      const statuses = await getModel('status').query();
      reply.render('statuses/index', { statuses });
    })
    .get('/statuses/new', { name: 'newStatus' }, async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', t('flash.authError'))
        reply.redirect(route('root'));
      }
      const status = new (getModel('status'));
      reply.render('statuses/new', { status });
    })
    .get('/statuses/:id/edit', { name: 'editStatus' }, async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', t('flash.authError'))
        reply.redirect(route('root'));
      }
      const { id } = req.params;
      const status = await getQueryBuilder('status').findOne({ id });
      reply.render('statuses/edit', { status });
    })
    .post('/statuses', async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', t('flash.authError'))
        reply.redirect(route('root'));
        return;
      }
      const { data } = req.body;
      const status = new (getModel('status'));
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
    .patch('/statuses/:id', { name: 'status' }, async () => {

    })
    .delete('/statuses/:id', async () => {

    })
};