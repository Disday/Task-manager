import { Model } from 'objection';

export default class BaseModel extends Model {
  static get modelPaths() {
    return [__dirname];
  }
  get sId() {
    return String(this.id);
  }
}
