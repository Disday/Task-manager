const BaseModel = require('./BaseModel.cjs');

module.exports = class Task extends BaseModel {
  static get viewName() {
    return this.tableName;
  }

  static get tableName() {
    return 'tasks';
  }

  static get modelPaths() {
    return [__dirname];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: 'integer' },
        labelIds: { type: 'array' },
        creatorId: { type: 'integer' },
        executorId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const User = require('./User.cjs');
    const Status = require('./Status.cjs');
    const Label = require('./Label.cjs');

    return {
      status: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Status,
        join: {
          from: 'tasks.status_id',
          to: 'statuses.id'
        }
      },

      labels: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Label,
        join: {
          from: 'tasks.id',
          through: {
            from: 'tasks_labels.task_id',
            to: 'tasks_labels.label_id'
          },
          to: 'labels.id'
        }
      },

      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.creator_id',
          to: 'users.id'
        }
      },

      executor: {
        relation: BaseModel.HasManyRelation,
        modelClass: User,
        join: {
          from: 'tasks.executor_id',
          to: 'users.id'
        }
      },
    }
  }
}
