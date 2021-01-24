import { default as Enemy, EnemyInfo } from './Enemy';
import CombatLogParser from './CombatLogParser';


class EnemyInstance extends Enemy {
  _instanceID: number;

  get instanceID() {
    return this._instanceID;
  }

  constructor(owner: CombatLogParser, baseInfo: EnemyInfo, instanceID = 0) {
    super(owner, baseInfo);

    this._instanceID = instanceID;
  }
}

export default EnemyInstance;
