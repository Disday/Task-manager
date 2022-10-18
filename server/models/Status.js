// @ts-check

import objectionUnique from 'objection-unique';
// import encrypt from '../lib/secure.cjs';
import BaseModel from './BaseModel.js';

const unique = objectionUnique({ fields: ['name'] });

export default class status extends unique(BaseModel) {
  get sId() {
    return String(this.id);
  }

  static get tableName() {
    return 'statuses';
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
