// @ts-check

import objectionUnique from 'objection-unique';
import encrypt from '../lib/secure.cjs';
import BaseModel from './BaseModel.js';

//Example of pattern Decorator
const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(BaseModel) {
  static get viewName() {
    return this.tableName;
  }

  static get tableName() {
    return 'users';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        firstName: {
          type: 'string',
          minLength: 1,
        },
        lastName: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 6 },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }
}
