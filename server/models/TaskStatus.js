// @ts-check

import objectionUnique from 'objection-unique';
// import encrypt from '../lib/secure.cjs';
import BaseModel from './BaseModel.js';

//Example of pattern Decorator
const unique = objectionUnique({ fields: ['name'] });

export default class TaskStatus extends unique(BaseModel) {
  static get viewName() {
    return 'taskStatuses';
  }

  static get tableName() {
    return 'task_statuses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1 },
      },
    };
  }

  // set password(value) {
  //   this.passwordDigest = encrypt(value);
  // }

  // verifyPassword(password) {
  //   return encrypt(password) === this.passwordDigest;
  // }
}
