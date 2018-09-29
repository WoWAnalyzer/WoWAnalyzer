import Entity from './Entity';

class Pet extends Entity {
  get name() {
    return this._baseInfo.name;
  }
  get type() {
    return this._baseInfo.type;
  }
  get guid() {
    return this._baseInfo.guid;
  }

  _baseInfo = null;
  constructor(owner, baseInfo) {
    super(owner);

    this._baseInfo = baseInfo;
  }
}

export default Pet;
