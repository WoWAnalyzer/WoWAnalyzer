import TALENTS from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, FightEndEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

const debug = false;

const EXECUTE_RANGE = 0.2;
const EXECUTE_RANGE_MASSACRE = 0.35;

/**
 * Tracks whether enemies are in Execute range through damage events so that it can be accessed in cast events by other modules.
 * Tracks the duration of the execution range of the fight.
 * @extends Analyzer
 */
class ExecuteRangeTracker extends Analyzer {
  enemyMap: Map<string, boolean> = new Map<string, boolean>();

  isExecPhase = false;
  execPhaseStart = 0;
  execPhaseDuration = 0;
  lastHitInExecPhase = 0;

  lowerThreshold = this.selectedCombatant.hasTalent(TALENTS.MASSACRE_SPEC_TALENT)
    ? EXECUTE_RANGE_MASSACRE
    : EXECUTE_RANGE;
  upperThreshold = 100;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this._onCast);
    this.addEventListener(Events.fightend, this._onFinished);
  }

  _onCast(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    this.enemyMap.set(
      targetString,
      (event.hitPoints || 1) / (event.maxHitPoints || 1) <= this.lowerThreshold ||
        (event.hitPoints || 1) / (event.maxHitPoints || 1) >= this.upperThreshold,
    );

    if (this.isTargetInExecuteRange(event.targetID, event.targetInstance)) {
      this.lastHitInExecPhase = event.timestamp;
    }

    if (this.isTargetInExecuteRange(event.targetID, event.targetInstance) && !this.isExecPhase) {
      this.isExecPhase = true;
      this.execPhaseStart = event.timestamp;
      debug && console.log('Execution phase started');
    }

    if (
      !this.isTargetInExecuteRange(event.targetID, event.targetInstance) &&
      this.isExecPhase &&
      event.timestamp > this.lastHitInExecPhase + 2000
    ) {
      this.isExecPhase = false;
      this.execPhaseDuration += event.timestamp - this.execPhaseStart;
      debug && console.log('Execution phase finished, total duration: ' + this.execPhaseDuration);
    }
  }

  _onFinished(event: FightEndEvent) {
    if (this.isExecPhase) {
      this.execPhaseDuration += event.timestamp - this.execPhaseStart;
      debug && console.log('Execution phase finished, total duration: ' + this.execPhaseDuration);
    }
  }

  /**
   * Returns whether the target is in Execute range.
   */
  isTargetInExecuteRange(targetID: number, targetInstance: number) {
    const targetString = encodeTargetString(targetID, targetInstance);
    return this.enemyMap.get(targetString);
  }

  /**
   * Returns the duration of the execution phase during the fight
   */
  executionPhaseDuration() {
    return this.execPhaseDuration;
  }
}

export default ExecuteRangeTracker;
