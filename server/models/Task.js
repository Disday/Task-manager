// import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel.js';
import TaskStatus from './TaskStatus.js';
import User from './User.js';

export default class Task extends BaseModel {
  static get viewName() {
    return this.tableName;
  }

  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    // Importing models here is one way to avoid require loops.

    return {
      taskStatus: {
        relation: BaseModel.BelongsToOneRelation,
        // The related model. This can be either a Model
        // subclass constructor or an absolute file path
        // to a module that exports one. We use a model
        // subclass constructor `Animal` here.
        modelClass: TaskStatus,
        join: {
          from: 'tasks.statusId',
          to: 'task_statuses.id'
        }
      },

      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.CreatorId',
          to: 'users.id'
          // ManyToMany relation needs the `through` object
          // to describe the join table.
          // through: {
          //   // If you have a model class for the join table
          //   // you need to specify it like this:
          //   // modelClass: PersonMovie,
          //   from: 'persons_movies.personId',
          //   to: 'persons_movies.movieId'
          // },
        }
      },

      executor: {
        relation: BaseModel.HasManyRelation,
        modelClass: User,
        join: {
          from: 'tasks.executorId',
          to: 'users.id'
        }
      },
    };
  }
}
