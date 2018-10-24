import Analyzer from 'parser/core/Analyzer';

import DeathDowntime from './DeathDowntime';

/**
 * Combines all the downtime modules into one value.
 */
class TotalDowntime extends Analyzer {
  static dependencies = {
    deathDowntime: DeathDowntime,
  };

  get totalBaseDowntime() {
    return this.deathDowntime.totalDowntime;
  }
  get totalDpsDowntime() {
    return this.totalBaseDowntime;
  }
  get totalHealingDowntime() {
    return this.totalBaseDowntime;
  }
  get totalTankingDowntime() {
    return this.totalBaseDowntime;
  }
}

export default TotalDowntime;
