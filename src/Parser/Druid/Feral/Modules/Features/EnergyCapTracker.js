import React from 'react';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import { formatDuration, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import RegenResourceCapTracker from 'Parser/Core/Modules/RegenResourceCapTracker';

/**
 * The analyzer is set up for BfA-prepatch where legendaries and other special 110 items are still
 * active. You can disable the efects when checking accuracy on logs with players above 115.
 */
const debugIsPlayerAbove115 = false;

// If you want to see debug information from RegenResourceCapTracker, you need to set debug there.
const debug = false;

const BERSERK_COST_MULTIPLIER = 0.6;

const BASE_ENERGY_REGEN = 10;
const CHATOYANT_SIGNET_REGEN_MULTIPLIER = 1.05;

const BASE_ENERGY_MAX = 100;
const CHATOYANT_SIGNET_MAX_ADDITION = 100;
const MOMENT_OF_CLARITY_MAX_ADDITION = 30;
const BERSERK_MAX_ADDITION = 50;
const STABILIZED_ENERGY_PENDANT_MAX_MULTIPLIER = 1.05;

const RESOURCE_REFUND_ON_MISS = 0.8;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating energy of a Feral druid.
 * Taking into account the effect of buffs, talents, and items on the energy cost of abilities,
 * the maximum energy amount, and the regeneration rate.
 * Note that some cost reduction effects are already accounted for in the log.
 *
 * No need to override getReducedDrain:
 * Reduced drain cost from Berserk/Incarnation on Ferocious Bite is already applied in the log.
 * Free bites from T21_4pc don't generate a drain event in the log.
 */
class EnergyCapTracker extends RegenResourceCapTracker {
  static resourceType = RESOURCE_TYPES.ENERGY;
  static baseRegenRate = BASE_ENERGY_REGEN;
  static isRegenHasted = true;
  static cumulativeEventWindow = 400;
  static buffsChangeMax = [
    SPELLS.BERSERK.id,
    SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id,
  ];
  static resourceRefundOnMiss = RESOURCE_REFUND_ON_MISS;
  static exemptFromRefund = [
    SPELLS.THRASH_FERAL.id,
    SPELLS.CAT_SWIPE.id,
    SPELLS.BRUTAL_SLASH_TALENT.id,
  ];

  getReducedCost(event) {
    let cost = super.getReducedCost(event);
    if (!cost) {
      return 0;
    }
    // no need to check for Clearcasting as the zero cost is already applied in the log
    // no need to check for T21_4pc as the free bite already shows as free in the log
    
    if (this.selectedCombatant.hasBuff(SPELLS.BERSERK.id) ||
        this.selectedCombatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)) {
      cost *= BERSERK_COST_MULTIPLIER;
      debug && console.log(`Cost reduced to ${cost} by Berserk/Incarnation`);
    }

    return cost;
  }

  naturalRegenRate() {
    let regen = super.naturalRegenRate();
    if (!debugIsPlayerAbove115 && this.selectedCombatant.getItem(ITEMS.CHATOYANT_SIGNET.id)) {
      // BFA: Chatoyant's effect will stop working after level 115.
      regen *= CHATOYANT_SIGNET_REGEN_MULTIPLIER;
    }
    return regen;
  }

  currentMaxResource() {
    let max = BASE_ENERGY_MAX;
    if (!debugIsPlayerAbove115 && this.selectedCombatant.getItem(ITEMS.CHATOYANT_SIGNET.id)) {
      // BFA: Chatoyant's effect will stop working after level 115.
      max += CHATOYANT_SIGNET_MAX_ADDITION;
    }
    if (this.selectedCombatant.hasTalent(SPELLS.MOMENT_OF_CLARITY_TALENT_FERAL.id)) {
      max += MOMENT_OF_CLARITY_MAX_ADDITION;
    }
    if (this.combatantHasBuffActive(SPELLS.BERSERK.id) || this.combatantHasBuffActive(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)) {
      // combatantHasBuffActive is used so that if the buff faded at this timestamp it will not count.
      max += BERSERK_MAX_ADDITION;
    }
    if (!debugIsPlayerAbove115 && this.selectedCombatant.getItem(ITEMS.STABILIZED_ENERGY_PENDANT.id)) {
      // BFA: Pendant's effect will stop working after level 115.
      // multiplier is applied after the additions
      max *= STABILIZED_ENERGY_PENDANT_MAX_MULTIPLIER;
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
  statisticOrder = STATISTIC_ORDER.CORE(1);
}
export default EnergyCapTracker;
