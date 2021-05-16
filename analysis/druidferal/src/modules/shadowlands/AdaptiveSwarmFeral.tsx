import Analyzer, { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { AdaptiveSwarm } from '@wowanalyzer/druid';

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

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.ADAPTIVE_SWARM_DAMAGE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        // TODO double check reasonable numbers
        minor: 0.60,
        average: 0.45,
        major: 0.30,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // TODO suggestion

  // TODO statistic

}

export default AdaptiveSwarmFeral;
