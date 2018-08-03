import React from 'react';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import RegenResourceCapTracker from 'Parser/Core/Modules/RegenResourceCapTracker';

import {isStealthOrDance} from '../Stealth/IsStealth';

const BASE_ENERGY_REGEN = 10;
const VIGOR_REGEN_MULTIPLIER = 1.1;

const BASE_ENERGY_MAX = 100;
const VIGOR_MAX_ADDITION = 50;

const RESOURCE_REFUND_ON_MISS = 0.8;
const SHADOW_FOCUS_MULTIPLIER = 0.8;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating energy of rogues.
 * Taking into account the effect of buffs, talents, and items on the energy cost of abilities,
 * the maximum energy amount, and the regeneration rate.
 */
class EnergyCapTracker extends RegenResourceCapTracker {
  static resourceType = RESOURCE_TYPES.ENERGY;
  static baseRegenRate = BASE_ENERGY_REGEN;
  static isRegenHasted = true;
  static cumulativeEventWindow = 400;
  static resourceRefundOnMiss = RESOURCE_REFUND_ON_MISS;
  static exemptFromRefund = [
  ];
  
  discountShadowFocus = false;
  constructor(...args) {
    super(...args);
    this.discountShadowFocus = this.selectedCombatant.hasTalent(SPELLS.SHADOW_FOCUS_TALENT.id);
  }

  getReducedCost(event) {
    const baseCost = super.getReducedCost(event);
    if (!baseCost) {
      return 0;
    }
    if(this.discountShadowFocus && isStealthOrDance(this.selectedCombatant,100)) {
      return baseCost * SHADOW_FOCUS_MULTIPLIER;
    }

    return baseCost;
  }

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

  get suggestionThresholds() {
    return {
      actual: this.missedRegenPerMinute,
      isGreaterThan: {
        minor: 20,
        average: 40,
        major: 60,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          You're allowing your energy to reach its cap. While at its maximum value you miss out on the energy that would have regenerated. Although it can be beneficial to let energy pool ready to be used at the right time, try to spend some before it reaches the cap.
        </React.Fragment>
      )
        .icon('spell_shadow_shadowworddominate')
        .actual(`${actual.toFixed(1)} regenerated energy lost per minute due to being capped.`)
        .recommended(`<${recommended} is recommended.`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${this.missedRegenPerMinute.toFixed(1)}`}
        label="Wasted energy per minute from being capped"
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
  statisticOrder = STATISTIC_ORDER.CORE(4);
}
export default EnergyCapTracker;
