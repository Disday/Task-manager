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
          relationError: 'Не удалось удалить пользователя, поскольку он связан с задачей ',
          success: 'Пользователь успешно удалён',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача создана',
        },
        update: {
          error: 'Не удалось сохранить данные',
          success: 'Задача успешно сохранёна',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          success: 'Задача успешно удалёна',
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
          relationError: 'Не удалось удалить статус, поскольку он связан с задачей ',
          success: 'Статус успешно удалён',
        },
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка создана',
        },
        update: {
          error: 'Не удалось сохранить данные',
          success: 'Метка успешно сохранёна',
        },
        delete: {
          error: 'Не удалось удалить метку',
          relationError: 'Не удалось удалить метку, поскольку она связана с задачей ',
          success: 'Метка успешно удалёна',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        tasks: 'Задачи',
        statuses: 'Статусы',
        labels: 'Метки',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        404: '404 Страницы не существует',
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
        statusId: 'Статус',
        labelsIds: 'Метки',
        description: 'Описание',
        creatorId: 'Автор',
        executorId: 'Исполнитель',
        createdAt: 'Дата создания',
        actions: 'Действия',
        new: {
          create: 'Создание задачи',
          save: 'Сохранить',
        },
        edit: 'Редактировать задачу',
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
        actions: 'Действия',
      },
      labels: {
        id: 'ID',
        name: 'Название',
        createdAt: 'Дата создания',
        new: {
          create: 'Создание Метки',
          save: 'Сохранить',
        },
        edit: 'Редактировать метку',
        actions: 'Действия',
      },
      welcome: {
        index: {
          hello: 'Менеждер задач',
          description: 'Управляй задачами!',
          more: 'Зарегистрируйтесь для полноценной работы',
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
