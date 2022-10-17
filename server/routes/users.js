// @ts-check

import { t } from 'i18next';
import _omit from 'lodash/omit.js';

export default (app) => {
  const getModel = (modelName) => app.objection.models[modelName];
  const isAuthorized = (req) => req.isAuthenticated() && Number(req.params.id) === req.user.id;

  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await getModel('user').query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .get('/users/:id/edit', { name: 'editUser' }, (req, reply) => {
      const { user } = req;
      if (!isAuthorized(req)) {
        req.flash('error', t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      reply.render('users/edit', { user });
      return reply;
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user();
      const { data } = req.body;
      user.$set(data);
      try {
        const validUser = await app.objection.models.user.fromJson(data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', t('flash.users.create.success'));
        reply.redirect(app.reverse('newSession'));
      } catch (e) {
        req.flash('error', t('flash.users.create.error'));
        reply.render('users/new', { user, errors: e.data });
      }

      return reply;
    })
    .patch('/users/:id', { name: 'patchUser' }, async (req, reply) => {
      if (!isAuthorized(req)) {
        req.flash('error', t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      const { data } = req.body;
      const { id } = req.params;
      const user = await getModel('user').query().findById(id); // refactor
      try {
        let validUser = await getModel('user').fromJson(data);
        if (data.password === '***') {
          validUser = _omit(validUser, 'passwordDigest');
        }
        await user.$query().patch(validUser);
        req.flash('info', t('flash.users.update.success'));
        reply.render('users/edit', { user });
        // return reply;
      } catch (e) {
        req.flash('error', t('flash.users.update.error'));
        reply.render('users/edit', { user, errors: e.data });
      }
      return reply;
    })
    .delete('/users/:id', { name: 'deleteUser' }, async (req, reply) => {
      if (!isAuthorized(req)) {
        req.flash('info', t('flash.authError'));
        reply.redirect(app.reverse('root'));
        return;
      }
      try {
        await getModel('user').query().findById(req.params.id).delete();
        req.logOut();
        req.flash('info', t('flash.users.delete.success'));
        reply.redirect(app.reverse('root'));
      } catch (e) {
        req.flash('error', t('flash.users.delete.error'));
        reply.redirect(app.reverse('users'));
      }
    });
};
