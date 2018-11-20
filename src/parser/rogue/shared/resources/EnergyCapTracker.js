import React from 'react';

import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import RegenResourceCapTracker from 'parser/shared/modules/RegenResourceCapTracker';

import SpellEnergyCost from './SpellEnergyCost';

const BASE_ENERGY_REGEN = 10;
const VIGOR_REGEN_MULTIPLIER = 1.1;

const BASE_ENERGY_MAX = 100;
const VIGOR_MAX_ADDITION = 50;

const RESOURCE_REFUND_ON_MISS = 0.8;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating energy of rogues.
 * Taking into account the effect of buffs, talents, and items on the energy cost of abilities,
 * the maximum energy amount, and the regeneration rate.
 */
class EnergyCapTracker extends RegenResourceCapTracker {
  static dependencies = {
    ...RegenResourceCapTracker.dependencies,
    // Needed for the `resourceCost` prop of events
    spellResourceCost: SpellEnergyCost,
  };

  static resourceType = RESOURCE_TYPES.ENERGY;
  static baseRegenRate = BASE_ENERGY_REGEN;
  static isRegenHasted = true;
  static cumulativeEventWindow = 400;
  static resourceRefundOnMiss = RESOURCE_REFUND_ON_MISS;
  static exemptFromRefund = [
  ];
  
  naturalRegenRate() {
    let regen = super.naturalRegenRate();
    if (this.selectedCombatant.hasTalent(SPELLS.VIGOR_TALENT.id)) {
      regen *= VIGOR_REGEN_MULTIPLIER;
    }
    return regen;
  }

  currentMaxResource() {
    let max = BASE_ENERGY_MAX;
    if (this.selectedCombatant.hasTalent(SPELLS.VIGOR_TALENT.id)) {
      max += VIGOR_MAX_ADDITION;
    }
    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }

  get wastedPercent() {
    return (this.missedRegen / this.naturalRegen) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You're allowing your energy to reach its cap. While at its maximum value you miss out on the energy that would have regenerated. Although it can be beneficial to let energy pool ready to be used at the right time, try to spend some before it reaches the cap.
        </>
      )
        .icon('spell_shadow_shadowworddominate')
        .actual(`${actual.toFixed(1)} regenerated energy lost per minute due to being capped.`)
        .recommended(`<${recommended} is recommended.`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(1)}
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Wasted energy from being capped"
        tooltip={`Although it can be beneficial to wait and let your energy pool ready to be used at the right time, you should still avoid letting it reach the cap.<br/>
        You spent <b>${formatPercentage(this.cappedProportion)}%</b> of the fight at capped energy, causing you to miss out on a total of <b>${this.missedRegen.toFixed(0)}</b> energy from regeneration.`}
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
