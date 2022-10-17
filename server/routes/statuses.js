import getUtils from '../../utilities/index.js';

export default (app) => {
  const { route, t, _, getModel, isAuthorized } = getUtils(app);

  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', t('flash.authError'))
        reply.redirect(route('root'));
      }
      const statuses = await getModel('status').query();
      reply.render('statuses/index', { statuses });
    })
    .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
      if (!req.isAuthenticated()) {
        req.flash('error', t('flash.authError'))
        reply.redirect(route('root'));
      }
      const status = new app.objection.models.status();
      // console.log(status);
      reply.render('statuses/new', { status });
    })
};