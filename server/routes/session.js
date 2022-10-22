// @ts-nocheck

import getUtils from '../../utils/utils.js';

export default (app) => {
  const { route, t } = getUtils(app);

  app
    .get('/session/new', { name: 'newSession' }, (req, reply) => {
      const signUpForm = {};
      // Example of polymorphism, signUpForm isnt entity of domain and doesnt have model.
      // But templating engine awaits signUpForm class to have viewName property. We add it for smooth uniform behaviour,
      // therefore object will implements interface
      signUpForm.constructor.viewName = 'users';
      reply.render('session/new', { signUpForm });
    })
    .post('/session', { name: 'session' }, app.fp.authenticate('form', async (req, reply, err, user) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (!user) {
        const signUpForm = req.body.data;
        signUpForm.constructor.viewName = 'users';
        const errors = {
          email: [{ message: t('flash.session.create.error') }],
        };
        reply.statusCode = '401';
        return reply.render('session/new', { signUpForm, errors });
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
