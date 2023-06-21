import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import AdaptiveSwarm from './AdaptiveSwarm';

/**
 * A damage dealing focused extension display module for Adaptive Swarm - for Feral and Balance
 */
class AdaptiveSwarmDamageDealer extends AdaptiveSwarm {
  static dependencies = {
    ...AdaptiveSwarm.dependencies,
    enemies: Enemies,
  };

  enemies!: Enemies;

  get damageUptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.ADAPTIVE_SWARM_DAMAGE.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.debuffUptimePercent,
      isLessThan: {
        minor: 0.65,
        average: 0.5,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the direct damage from Adaptive Swarm and the damage enabled by its
            boost to periodic effects. The DoT had an uptime of{' '}
            <strong>{formatPercentage(this.debuffUptime / this.owner.fightDuration, 0)}%</strong>.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemDamageDone(this.directDamage)}</strong>
              </li>
              <li>
                Boost: <strong>{this.owner.formatItemDamageDone(this.boostedDamage)}</strong>
              </li>
            </ul>
            In addition, Adaptive Swarm did{' '}
            <strong>{formatNumber(this.owner.getPerSecond(this.totalHealing))} HPS</strong> over the
            encounter with a HoT uptime of{' '}
            <strong>{formatPercentage(this.buffUptime / this.owner.fightDuration, 0)}%</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.ADAPTIVE_SWARM}>
          <ItemPercentDamageDone amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AdaptiveSwarmDamageDealer;
