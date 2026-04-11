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
  private readonly baseInfo: EnemyInfo;
  readonly instanceID: number;

  override get name() {
    return this.baseInfo.name;
  }

  /** Generally "NPC" */
  get type() {
    return this.baseInfo.type;
  }

  /** Generally "Boss" or "NPC" */
  get subType() {
    return this.baseInfo.subType;
  }

  get guid() {
    return this.baseInfo.guid;
  }

  get id() {
    return this.baseInfo.id;
  }

  get fights() {
    return this.baseInfo.fights;
  }

  constructor(owner: CombatLogParser, baseInfo: EnemyInfo, instanceID = 0) {
    super(owner);
    this.baseInfo = baseInfo;
    this.instanceID = instanceID;
  }
}

export default Enemy;
