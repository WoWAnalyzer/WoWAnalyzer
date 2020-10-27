import CombatLogParser from './CombatLogParser';
import Entity from './Entity';

export interface EnemyInfo {
  name: string;
  type: string;
  guid: string;
  id: number;
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

  _baseInfo: EnemyInfo;

  constructor(owner: CombatLogParser, baseInfo: EnemyInfo) {
    super(owner);
    this._baseInfo = baseInfo;
  }
}

export default Enemy;
