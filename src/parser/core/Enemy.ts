import CombatLogParser from './CombatLogParser';
import Entity from './Entity';
import Unit from './Unit';

interface EnemyFight {
  id: number;
  groups: number;
  instances: number;
}

export interface EnemyInfo extends Unit {
  fights: EnemyFight[];
}

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

  get instanceID() {
    return this._instanceID;
  }

  _baseInfo: EnemyInfo;
  _instanceID: number;

  constructor(owner: CombatLogParser, baseInfo: EnemyInfo, instanceID = 0) {
    super(owner);
    this._baseInfo = baseInfo;
    this._instanceID = instanceID;
  }
}

export default Enemy;
