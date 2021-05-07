import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { AdaptiveSwarm } from '@wowanalyzer/druid';

import Mastery from '../../core/Mastery';

/**
 * Resto's display module for Adaptive Swarm.
 */
class AdaptiveSwarmResto extends AdaptiveSwarm {
  static dependencies = {
    ...AdaptiveSwarm.dependencies,
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NECROLORD.id);
  }

  get masteryHealing() {
    return this.mastery.getMasteryHealing(SPELLS.ADAPTIVE_SWARM_HEAL.id);
  }

  /** The actual total healing for Resto must also include the mastery attribution */
  get totalHealingWithMastery() {
    return this.totalHealing + this.masteryHealing;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the sum of the direct healing from Adaptive Swarm, the healing enabled by its
            extra mastery stack, and the healing enabled by its boost to periodic effects. It had an
            average healing uptime per cast of{' '}
            <strong>{(this.buffTimePerCast / 1000).toFixed(0)}s</strong>.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemHealingDone(this.directHealing)}</strong>
              </li>
              <li>
                Mastery: <strong>{this.owner.formatItemHealingDone(this.masteryHealing)}</strong>
              </li>
              <li>
                Boost: <strong>{this.owner.formatItemHealingDone(this.boostedHealing)}</strong>
              </li>
            </ul>
            In addition, Adaptive Swarm did{' '}
            <strong>{formatNumber(this.owner.getPerSecond(this.totalDamage))} DPS</strong> over the
            encounter with an average damage uptime per cast of{' '}
            <strong>{(this.debuffTimePerCast / 1000).toFixed(0)}s</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.ADAPTIVE_SWARM}>
          <ItemPercentHealingDone amount={this.totalHealingWithMastery} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AdaptiveSwarmResto;
