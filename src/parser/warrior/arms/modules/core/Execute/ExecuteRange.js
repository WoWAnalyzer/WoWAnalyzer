import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';

const debug = false;

const EXECUTE_RANGE = 0.2;
const EXECUTE_RANGE_MASSACRE = 0.35;

/**
 * Tracks whether enemies are in Execute range through damage events so that it can be accessed in cast events by other modules.
 * Tracks the duration of the execution range of the fight.
 * @extends Analyzer
 */
class ExecuteRangeTracker extends Analyzer {

  execRange = (this.selectedCombatant.hasTalent(SPELLS.MASSACRE_TALENT_ARMS.id) ? EXECUTE_RANGE_MASSACRE : EXECUTE_RANGE);
  enemyMap = {};

  isExecPhase = false;
  execPhaseStart = 0;
  execPhaseDuration = 0;
  lastHitInExecPhase = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this._onCast);
    this.addEventListener(Events.fightend, this._onFinished);
  }

  _onCast(event) {
    if (event.targetIsFriendly) {
      return;
    }
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    this.enemyMap[targetString] = event.hitPoints / event.maxHitPoints <= this.execRange;

    if (this.isTargetInExecuteRange(event)) {
      this.lastHitInExecPhase = event.timestamp;
    }

    if (this.isTargetInExecuteRange(event) && !this.isExecPhase) {
      this.isExecPhase = true;
      this.execPhaseStart = event.timestamp;
      debug && console.log("Execution phase started");
    }

    if (!this.isTargetInExecuteRange(event) && this.isExecPhase && event.timestamp > this.lastHitInExecPhase + 2000) {
      this.isExecPhase = false;
      this.execPhaseDuration += event.timestamp - this.execPhaseStart;
      debug && console.log("Execution phase finished, total duration: " + this.execPhaseDuration);
    }
  }

  _onFinished(event) {
    if (this.isExecPhase) {
      this.execPhaseDuration += event.timestamp - this.execPhaseStart;
      debug && console.log("Execution phase finished, total duration: " + this.execPhaseDuration);
    }
  }

  /**
   * Returns whether the target is in Execute range.
   */
  isTargetInExecuteRange({ targetID, targetInstance }) {
    const targetString = encodeTargetString(targetID, targetInstance);
    return this.enemyMap[targetString];
  }

  /**
   * Returns the duration of the execution phase during the fight
   */
  executionPhaseDuration() {
    return this.execPhaseDuration;
  }
}

export default ExecuteRangeTracker;
