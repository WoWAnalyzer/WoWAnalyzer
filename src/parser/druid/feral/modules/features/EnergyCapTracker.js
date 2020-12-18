import React from 'react';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import RegenResourceCapTracker from 'parser/shared/modules/resources/resourcetracker/RegenResourceCapTracker';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue';

import { t } from '@lingui/macro';

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
class EnergyCapTracker extends RegenResourceCapTracker {
  get percentCapped() {
    return (this.naturalRegen - this.missedRegen) / this.naturalRegen;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentCapped,
      isLessThan: {
        minor: .8,
        average: .70,
        major: .65,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    ...RegenResourceCapTracker.dependencies,
    // Needed for the `resourceCost` prop of events
    spellResourceCost: SpellEnergyCost,
  };
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
    SPELLS.SWIPE_CAT.id,
    SPELLS.BRUTAL_SLASH_TALENT.id,
  ];

  currentMaxResource() {
    let max = BASE_ENERGY_MAX;
    if (this.selectedCombatant.hasTalent(SPELLS.MOMENT_OF_CLARITY_TALENT.id)) {
      max += MOMENT_OF_CLARITY_MAX_ADDITION;
    }
    if (this.combatantHasBuffActive(SPELLS.BERSERK.id) || this.combatantHasBuffActive(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)) {
      // combatantHasBuffActive is used so that if the buff faded at this timestamp it will not count.
      max += BERSERK_MAX_ADDITION;
    }
    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        You're allowing your energy to reach its cap. While at its maximum value you miss out on the energy that would have regenerated. Although it can be beneficial to let energy pool ready to be used at the right time, try to spend some before it reaches the cap.
      </>,
    )
      .icon('spell_shadow_shadowworddominate')
      .actual(t({
      id: "druid.feral.suggestions.energy.efficiency",
      message: `${formatPercentage(actual)}% regenerated energy lost per minute due to being capped.`
    }))
      .recommended(`<${recommended}% is recommended.`));
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            Although it can be beneficial to wait and let your energy pool ready to be used at the right time, you should still avoid letting it reach the cap.<br />
            You spent <strong>{formatPercentage(this.cappedProportion)}%</strong> of the fight at capped energy, causing you to miss out on a total of <strong>{this.missedRegen.toFixed(0)}</strong> energy from regeneration.
          </>
        )}
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
      >
        <BoringResourceValue resource={RESOURCE_TYPES.ENERGY} value={`${formatPercentage(this.percentCapped)}%`} label="Wasted energy per minute from being capped" />
      </Statistic>
    );
  }
}

export default EnergyCapTracker;
