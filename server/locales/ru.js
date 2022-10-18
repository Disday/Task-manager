// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        update: {
          error: 'Не удалось сохранить данные',
          success: 'Пользователь успешно сохранён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          success: 'Пользователь успешно удалён',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус создан',
        },
        update: {
          error: 'Не удалось сохранить данные',
          success: 'Статус успешно сохранён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        firstName: 'Имя',
        lastName: 'Фамилия',
        password: 'Пароль',
        email: 'Email',
        createdAt: 'Дата создания',
        actions: 'Действия',
        edit: 'Ваш профиль',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Название',
        createdAt: 'Дата создания',
        new: {
          create: 'Создание статуса',
          save: 'Сохранить',
        },
        edit: 'Редактировать статус',
      },
      welcome: {
        index: {
          hello: 'Менеждер задач',
          description: 'Управляй задачами!',
          more: 'Ссылка',
        },
      },
      actions: {
        create: 'Создать',
        delete: 'Удалить',
        edit: 'Редактировать',
      },
    },
  },
};
