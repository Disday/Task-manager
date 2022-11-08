// @ts-check

const BaseModel = require('./BaseModel.cjs');

module.exports = class Label
 extends BaseModel {
  
  static get tableName() {
    return 'labels';
  }
  
  static get viewName() {
    return this.tableName;
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
