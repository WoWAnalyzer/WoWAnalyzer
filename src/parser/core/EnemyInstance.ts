import CombatLogParser from './CombatLogParser';
import { default as Enemy, EnemyInfo } from './Enemy';

class EnemyInstance extends Enemy {
  override readonly instanceID: number;

  constructor(owner: CombatLogParser, baseInfo: EnemyInfo, instanceID = 0) {
    super(owner, baseInfo);

    this.instanceID = instanceID;
  }
}

export default EnemyInstance;
