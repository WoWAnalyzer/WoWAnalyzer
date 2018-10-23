import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';


const EXECUTE_RANGE = 0.2;
const EXECUTE_RANGE_MASSACRE = 0.35;
/**
 * Tracks whether enemies are in Execute range through damage events so that it can be accessed in cast events by other modules.
 * @extends Analyzer
 */
class ExecuteRangeTracker extends Analyzer {

  exec_range = (this.selectedCombatant.hasTalent(SPELLS.MASSACRE_TALENT_ARMS.id) ? EXECUTE_RANGE_MASSACRE : EXECUTE_RANGE);

  enemyMap = {};

  on_byPlayer_damage(event) {
    if(event.targetIsFriendly) return;
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    this.enemyMap[targetString] = event.hitPoints / event.maxHitPoints <= this.exec_range;
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
