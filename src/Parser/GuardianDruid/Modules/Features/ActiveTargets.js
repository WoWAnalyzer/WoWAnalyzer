import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

/*
 * The amount of time elapsed without a combat event before a target is considered inactive.
 * The ideal size of this window will vary; specs that produce a lot of combat events can
 * have a lower threshold value.
 */
const ACTIVITY_THRESHOLD = 3000;

class ActiveTargets extends Module {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  /* Targets are considered inactive by default.  Once they are part of a damage event,
   * they become active.  If they are not part of another damage event after a certain
   * amount of time has passed, they are considered inactive again.
  */
  _targetActivity = {};

  /* Only player damage to the target is reliable for detecting enemy activity
   * (mechanics like Shadow Shot on Sisters can trigger damage events even though
   * the enemy is not targetable)
   */
  on_byPlayer_damage(event) {
    if (event.targetIsFriendly === false && event.targetID !== undefined) {
      this.registerEnemyActivity(event.targetID, this.owner.currentTimestamp);
    }
  }

  registerEnemyActivity(enemyID, timestamp) {
    if (!this._targetActivity[enemyID]) {
      this._targetActivity[enemyID] = [];
    }

    const enemyTimeline = this._targetActivity[enemyID];

    if (enemyTimeline.length === 0) {
      enemyTimeline.push({ start: timestamp, end: timestamp + ACTIVITY_THRESHOLD });
      return;
    }

    const lastEvent = enemyTimeline[enemyTimeline.length - 1];

    if (lastEvent.end > timestamp) {
      lastEvent.end = timestamp + ACTIVITY_THRESHOLD;
    } else {
      enemyTimeline.push({ start: timestamp, end: timestamp + ACTIVITY_THRESHOLD });
    }
  }

  isTargetActive(enemyID, timestamp) {
    if (!this._targetActivity[enemyID]) {
      return false;
    }

    return this._targetActivity[enemyID].findIndex(activity => activity.start < timestamp && activity.end > timestamp) >= 0;
  }

  getActiveTargets(timestamp) {
    return Object.keys(this._targetActivity).filter(enemyID => this.isTargetActive(enemyID, timestamp));
  }
}

export default ActiveTargets;
