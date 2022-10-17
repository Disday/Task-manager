// @ts-check

import getUtils from '../../utilities/index.js';

export default (app) => {
  const { route, t } = getUtils(app);
  
  app
    .get('/session/new', { name: 'newSession' }, (req, reply) => {
      const signInForm = {};
      reply.render('session/new', { signInForm });
    })
    .post('/session', { name: 'session' }, app.fp.authenticate('form', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        const signInForm = req.body.data;
        const errors = {
          email: [{ message: t('flash.session.create.error') }],
        };
        reply.statusCode = '401';
        return reply.render('session/new', { signInForm, errors });
      }
      await req.logIn(user);
      req.flash('success', t('flash.session.create.success'));
      return reply.redirect(route('root'));
    }))
    .delete('/session', (req, reply) => {
      req.logOut();
      req.flash('info', t('flash.session.delete.success'));
      reply.redirect(route('root'));
    });
};
