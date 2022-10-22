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
      taskStatuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус создан',
        },
        update: {
          error: 'Не удалось сохранить данные',
          success: 'Статус успешно сохранён',
          // nonexist: 'Статус успешно сохранён',
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
        tasks: 'Задачи',
        taskStatuses: 'Статусы',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        404: '404 Страницы не существует'
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
        // password: 'Пароль',
        // email: 'Email',
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
      tasks: {
        id: 'ID',
        name: 'Название',
        status: 'Статус',
        description: 'Описание',
        creator: 'Автор',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
        actions: 'Действия',
        new: {
          create: 'Создание задачи',
          save: 'Сохранить',
        },
      },
      taskStatuses: {
        id: 'ID',
        name: 'Название',
        createdAt: 'Дата создания',
        new: {
          create: 'Создание статуса',
          save: 'Сохранить',
        },
        edit: 'Редактировать статус',
        actions: 'Действия',
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
