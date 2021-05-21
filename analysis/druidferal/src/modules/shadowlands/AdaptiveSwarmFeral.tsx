import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

import { AdaptiveSwarm } from '@wowanalyzer/druid';

import uptimeBarSubStatistic from '../core/UptimeBarSubStatistic';

/**
 * Resto's display module for Adaptive Swarm.
 */
class AdaptiveSwarmFeral extends AdaptiveSwarm {
  static dependencies = {
    ...AdaptiveSwarm.dependencies,
    enemies: Enemies,
  };

  enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id);
  }

  get damageUptime() {
    return this.enemies.getBuffUptime(SPELLS.ADAPTIVE_SWARM_DAMAGE.id) / this.owner.fightDuration;
  }

  get damageUptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.ADAPTIVE_SWARM_DAMAGE.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.damageUptime,
      isLessThan: {
        // TODO double check reasonable numbers
        minor: 0.6,
        average: 0.45,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // TODO suggestion

  // TODO damage statistic

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      SPELLS.ADAPTIVE_SWARM,
      this.damageUptimeHistory,
    );
  }
}

export default AdaptiveSwarmFeral;
