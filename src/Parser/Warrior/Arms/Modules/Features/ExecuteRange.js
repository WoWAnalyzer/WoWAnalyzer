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

    if(this.enemyMap[targetString] === undefined) {
      this.enemyMap[targetString] = [];
    }

    const inExecuteRange = event.hitPoints / event.maxHitPoints <= EXECUTE_RANGE;

    const timeline = this.enemyMap[targetString];
    const newEvent = timeline.length === 0 || timeline[timeline.length - 1].timestamp !== event.timestamp;
    const differentState = timeline.length === 0 || timeline[timeline.length - 1].inExecuteRange !== inExecuteRange;

    if(!differentState) {
      // Stop if the state is the same as the last event.
      return;
    }

    if(newEvent) {
      // If this event is more recent than the last event, record it.
      timeline.push({
        timestamp: event.timestamp,
        inExecuteRange: inExecuteRange,
      });
    } else {
      // If this event is the same as timestamp as the last event, modify the last record.
      timeline[timeline.length - 1].inExecuteRange = inExecuteRange;
    }
  }

  /**
   * Returns whether the target was in Execute range at the current timestamp.
   */
  isTargetInExecuteRange({ targetID, targetInstance, timestamp }) {
    const targetString = encodeTargetString(targetID, targetInstance);
    const timeline = this.enemyMap[targetString];

    for(let i = 0; i < timeline.length; i++) {
      const record1 = timeline[i];
      const record2 = i + 1 < timeline.length ? timeline[i + 1] : null;

      if(record1.timestamp > timestamp) {
        return null;
      }

      if(record1.timestamp < timestamp && (record2 === null || record2.timestamp > timestamp)) {
        return record1.inExecuteRange;
      }
    }
  }
}

export default ExecuteRangeTracker;
