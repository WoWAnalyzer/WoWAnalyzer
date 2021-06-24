import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';
import React from 'react';

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

  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.ADAPTIVE_SWARM],
        uptimes: this.damageUptimeHistory,
      },
      [],
      SubPercentageStyle.RELATIVE,
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.COVENANTS}
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

export default AdaptiveSwarmFeral;
