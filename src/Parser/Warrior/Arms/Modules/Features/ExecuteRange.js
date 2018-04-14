import Analyzer from 'Parser/Core/Analyzer';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

const EXECUTE_RANGE = 0.2;

/**
 * Tracks whether enemies are in Execute range through damage events so that it can be accessed in cast events by other modules.
 * @extends Analyzer
 */
class ExecuteRangeTracker extends Analyzer {
  enemyMap = {};

  on_byPlayer_damage(event) {
    if(event.targetIsFriendly) {
      return;
    }

    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    this.enemyMap[targetString] = event.hitPoints / event.maxHitPoints <= EXECUTE_RANGE;
  }

  /**
   * Returns whether the target is in Execute range.
   */
  isTargetInExecuteRange({ targetID, targetInstance }) {
    const targetString = encodeTargetString(targetID, targetInstance);
    return this.enemyMap[targetString];
  }
}

export default ExecuteRangeTracker;
