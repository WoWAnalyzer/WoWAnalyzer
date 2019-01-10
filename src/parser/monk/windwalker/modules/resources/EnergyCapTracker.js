import React from 'react';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import RegenResourceCapTracker from 'parser/shared/modules/RegenResourceCapTracker';

const BASE_ENERGY_REGEN = 10;
const ASCENSION_REGEN_MULTIPLIER = 1.1;

const BASE_ENERGY_MAX = 100;
const ASCENSION_ENERGY_MAX_ADDITION = 20;

const RESOURCE_REFUND_ON_MISS = 0.8;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating energy of a Windwalker monk.
 * Taking into account the effect of buffs, talents, and items on the energy cost of abilities,
 * the maximum energy amount, and the regeneration rate.
 * Note that some cost reduction effects are already accounted for in the log.
 */
class EnergyCapTracker extends RegenResourceCapTracker {
  static resourceType = RESOURCE_TYPES.ENERGY;
  static baseRegenRate = BASE_ENERGY_REGEN;
  static isRegenHasted = true;
  static cumulativeEventWindow = 400;
  static resourceRefundOnMiss = RESOURCE_REFUND_ON_MISS;

  naturalRegenRate() {
    let regen = super.naturalRegenRate();
    if (this.selectedCombatant.hasTalent(SPELLS.ASCENSION_TALENT.id)) {
      regen *= ASCENSION_REGEN_MULTIPLIER;
    }
    return regen;
  }

  currentMaxResource() {
    let max = BASE_ENERGY_MAX;
    if (this.selectedCombatant.hasTalent(SPELLS.ASCENSION_TALENT.id)) {
      max += ASCENSION_ENERGY_MAX_ADDITION;
    }
    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(8)}
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${formatPercentage(this.cappedProportion)}%`}
        label="Time with capped energy"
        tooltip={`Although it can be beneficial to wait and let your energy pool ready to be used at the right time, you should still avoid letting it reach the cap.<br/>
        You spent <b>${formatPercentage(this.cappedProportion)}%</b> of the fight at capped energy, causing you to miss out on <b>${this.missedRegenPerMinute.toFixed(1)}</b> energy per minute from regeneration.`}
        footer={(
          <div className="statistic-bar">
            <div
              className="stat-healing-bg"
              style={{ width: `${(1 - this.cappedProportion) * 100}%` }}
              data-tip={`Not at capped energy for ${formatDuration((this.owner.fightDuration - this.atCap) / 1000)}`}
            >
              <img src="/img/sword.png" alt="Uncapped Energy" />
            </div>

            <div
              className="remainder DeathKnight-bg"
              data-tip={`At capped energy for ${formatDuration(this.atCap / 1000)}`}
            >
              <img src="/img/overhealing.png" alt="Capped Energy" />
            </div>
          </div>
        )}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
}
export default EnergyCapTracker;