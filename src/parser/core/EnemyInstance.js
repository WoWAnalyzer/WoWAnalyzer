import Enemy from './Enemy';

class EnemyInstance extends Enemy {
  get instanceID() {
    return this._instanceID;
  }

  constructor(owner, baseInfo, instanceID = 0) {
    super(owner, baseInfo);

    this._instanceID = instanceID;
  }
}

export default EnemyInstance;
