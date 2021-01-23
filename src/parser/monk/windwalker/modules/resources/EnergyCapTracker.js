import React from 'react';
import { Icon } from 'interface';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RegenResourceCapTracker from 'parser/shared/modules/resources/resourcetracker/RegenResourceCapTracker';
import { Tooltip } from 'interface';

const BASE_ENERGY_REGEN = 10;
const ASCENSION_REGEN_MULTIPLIER = 1.1;
const EE_REGEN_ADDITION = 15;

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
  static buffsChangeRegen = [SPELLS.ENERGIZING_ELIXIR_TALENT.id];

  naturalRegenRate() {
    let regen = super.naturalRegenRate();
    if (this.selectedCombatant.hasTalent(SPELLS.ASCENSION_TALENT.id)) {
      regen *= ASCENSION_REGEN_MULTIPLIER;
    }
    // Energizing Elixir adds 15 energy per second regen for 5 seconds, not increased by haste
    if (this.combatantHasBuffActive(SPELLS.ENERGIZING_ELIXIR_TALENT.id)){
      regen += EE_REGEN_ADDITION;
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
        tooltip={(
          <>
            Although it can be beneficial to wait and let your energy pool ready to be used at the right time, you should still avoid letting it reach the cap.<br />
            You spent <b>{formatPercentage(this.cappedProportion)}%</b> of the fight at capped energy, causing you to miss out on <b>{this.missedRegenPerMinute.toFixed(1)}</b> energy per minute from regeneration.
          </>
        )}
        footer={(
          <div className="statistic-box-bar">
            <Tooltip content={`Not at capped energy for ${formatDuration((this.owner.fightDuration - this.atCap) / 1000)}`}>
              <div
                className="stat-healing-bg"
                style={{ width: `${(1 - this.cappedProportion) * 100}%` }}
              >
                <img src="/img/sword.png" alt="Uncapped Energy" />
              </div>
            </Tooltip>

            <Tooltip content={`At capped energy for ${formatDuration(this.atCap / 1000)}`}>
              <div className="remainder DeathKnight-bg" >
                <img src="/img/overhealing.png" alt="Capped Energy" />
              </div>
            </Tooltip>
          </div>
        )}
      />
    );
  }
}
export default EnergyCapTracker;
