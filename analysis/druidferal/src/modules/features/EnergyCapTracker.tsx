import { t } from '@lingui/macro';
import { formatPercentage, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Icon, Tooltip } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import RegenResourceCapTracker from 'parser/shared/modules/resources/resourcetracker/RegenResourceCapTracker';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBox from 'parser/ui/StatisticBox';
import React from 'react';

import SpellEnergyCost from './SpellEnergyCost';

const BASE_ENERGY_REGEN = 11;
const BASE_ENERGY_MAX = 100;
const MOMENT_OF_CLARITY_MAX_ADDITION = 30;
const BERSERK_MAX_ADDITION = 50;

const RESOURCE_REFUND_ON_MISS = 0.8;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating energy of a Feral druid.
 * Taking into account the effect of buffs, talents, and items on the energy cost of abilities,
 * the maximum energy amount, and the regeneration rate.
 * Note that some cost reduction effects are already accounted for in the log.
 *
 * No need to override getReducedDrain:
 * Reduced drain cost from Berserk/Incarnation on Ferocious Bite is already applied in the log.
 */
// TODO change over energy cap tracker to per minute?
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
  static buffsChangeMax = [SPELLS.BERSERK.id, SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id];
  static resourceRefundOnMiss = RESOURCE_REFUND_ON_MISS;
  static exemptFromRefund = [
    SPELLS.THRASH_FERAL.id,
    SPELLS.SWIPE_CAT.id,
    SPELLS.BRUTAL_SLASH_TALENT.id,
  ];

  get percentNotCapped() {
    return (this.naturalRegen - this.missedRegen) / this.naturalRegen;
  }

  get percentCapped() {
    return this.missedRegen / this.naturalRegen;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentCapped,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  currentMaxResource() {
    let max = BASE_ENERGY_MAX;
    if (this.selectedCombatant.hasTalent(SPELLS.MOMENT_OF_CLARITY_TALENT.id)) {
      max += MOMENT_OF_CLARITY_MAX_ADDITION;
    }
    if (
      this.combatantHasBuffActive(SPELLS.BERSERK.id) ||
      this.combatantHasBuffActive(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)
    ) {
      // combatantHasBuffActive is used so that if the buff faded at this timestamp it will not count.
      max += BERSERK_MAX_ADDITION;
    }
    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You're allowing your energy to reach its cap. While at its maximum value you miss out on
          the energy that would have regenerated. Although it can be beneficial to let energy pool
          ready to be used at the right time, try to spend some before it reaches the cap.
        </>,
      )
        .icon('spell_shadow_shadowworddominate')
        .actual(
          t({
            id: 'druid.feral.suggestions.energy.efficiency',
            message: `${formatPercentage(
              actual,
            )}% regenerated energy lost per minute due to being capped.`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${formatPercentage(this.cappedProportion)}%`}
        label="Time with capped energy"
        tooltip={
          <>
            Although it can be beneficial to wait and let your energy pool ready to be used at the
            right time, you should still avoid letting it reach the cap.
            <br />
            You spent <b>{formatPercentage(this.cappedProportion)}%</b> of the fight at capped
            energy, causing you to miss out on <b>{this.missedRegenPerMinute.toFixed(1)}</b> energy
            per minute from regeneration.
          </>
        }
        footer={
          <div className="statistic-box-bar">
            <Tooltip
              content={`Not at capped energy for ${formatDuration(
                this.owner.fightDuration - this.atCap,
              )}`}
            >
              <div
                className="stat-healing-bg"
                style={{ width: `${(1 - this.cappedProportion) * 100}%` }}
              >
                <img src="/img/sword.png" alt="Uncapped Energy" />
              </div>
            </Tooltip>

            <Tooltip content={`At capped energy for ${formatDuration(this.atCap)}`}>
              <div className="remainder DeathKnight-bg">
                <img src="/img/overhealing.png" alt="Capped Energy" />
              </div>
            </Tooltip>
          </div>
        }
      />
    );
  }
}

export default EnergyCapTracker;
