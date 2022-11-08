// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

//Example of pattern Decorator
const unique = objectionUnique({ fields: ['name'] });

module.exports = class Status extends unique(BaseModel) {
  static get viewName() {
    return 'statuses';
  }

  static get tableName() {
    return 'statuses';
  }

  toString() {
    return this.name;
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
}
