import { ResurrectEvent } from 'parser/core/Events';
import CoreDeathTracker from 'parser/shared/modules/DeathTracker';

import { TIME_SPENT_DEAD_THRESHOLD } from './constants';

/**
 * Due to combatlog restrictions it is not possible to know whether the hunter cast Feign Death or the hunter actually died.
 * For this module we assume any single death lasting less than 0.2% of an encounter (1.2 seconds on a 10 minute fight) was due to Feign Death, and thus we remove it as it is improbable anyone is that fast to ress anyone.
 */
class DeathTracker extends CoreDeathTracker {
  static dependencies = {
    ...CoreDeathTracker.dependencies,
  };

  deathPercentageOfEncounter(deathTimestamp: number, ressTimestamp: number) {
    return (ressTimestamp - deathTimestamp) / this.owner.fightDuration;
  }

  resurrect(event: ResurrectEvent) {
    this.lastResurrectionTimestamp = this.owner.currentTimestamp;
    const percentSpentDead = this.deathPercentageOfEncounter(
      this.lastDeathTimestamp,
      this.lastResurrectionTimestamp,
    );
    if (percentSpentDead > TIME_SPENT_DEAD_THRESHOLD) {
      super.resurrect(event);
    } else {
      this.isAlive = true;
      this.deaths.pop();
    }
  }
}

export default DeathTracker;
