import Entity from './Entity';

class Enemy extends Entity {
  get name() {
    return this._baseInfo.name;
  }
  get type() {
    return this._baseInfo.type;
  }
  get guid() {
    return this._baseInfo.guid;
  }
  get id() {
    return this._baseInfo.id;
  }

  _baseInfo = null;
  constructor(owner, baseInfo) {
    super(owner);

    this._baseInfo = baseInfo;
  }
}

export default Enemy;
