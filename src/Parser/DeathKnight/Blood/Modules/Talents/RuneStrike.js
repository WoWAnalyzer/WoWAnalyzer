import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import { formatPercentage, formatDuration } from 'common/format';
import RuneTracker from '../../../Shared/RuneTracker';

const MS_REDUCTION_PER_RUNE = 1000;
const ONLY_CAST_BELOW_RUNES = 3;

class RuneStrike extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    runeTracker: RuneTracker,
  };

  wastedReduction = 0;
  effectiveReduction = 0;
  badCasts = 0;
  goodCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RUNE_STRIKE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.RUNE_STRIKE_TALENT.id && this.runeTracker.runesAvailable >= ONLY_CAST_BELOW_RUNES) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `${SPELLS.RUNE_STRIKE_TALENT.name} was used with ${this.runeTracker.runesAvailable} runes available, wasting potential recharge time on your runes.`;
      this.badCasts += 1;
      return;
    }

    if (event.ability.guid === SPELLS.RUNE_STRIKE_TALENT.id ) {
      this.goodCasts += 1;
      return;
    }


    if (!event.classResources) {
      return;
    }
    event.classResources
      .filter(resource => resource.type === RESOURCE_TYPES.RUNES.id)
      .forEach(({ amount, cost }) => {
        const runeCost = cost || 0;
        if (runeCost <= 0) {
          return;
        }
        for (let i = 0; i < runeCost; i++) { 
          if (!this.spellUsable.isOnCooldown(SPELLS.RUNE_STRIKE_TALENT.id)) {
            this.wastedReduction += MS_REDUCTION_PER_RUNE;
          } else {
            const effectiveReduction = this.spellUsable.reduceCooldown(SPELLS.RUNE_STRIKE_TALENT.id, MS_REDUCTION_PER_RUNE);
            this.effectiveReduction += effectiveReduction;
            this.wastedReduction += MS_REDUCTION_PER_RUNE - effectiveReduction;
          }
        }
      });
  }

  get cooldownReductionEfficiency() {
    return this.effectiveReduction / (this.wastedReduction + this.effectiveReduction);
  }

  get goodCastEfficiency() {
    return this.goodCasts / (this.goodCasts + this.badCasts);
  }

  get cooldownReductionThresholds() {
    return {
      actual: this.cooldownReductionEfficiency,
      isLessThan: {
        minor: 1,
        average: 0.85,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.cooldownReductionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>You wasted {formatDuration(this.wastedReduction / 1000)} worth of reduction by capping out on <SpellLink id={SPELLS.RUNE_STRIKE_TALENT.id} /> charges.</React.Fragment>)
            .icon(SPELLS.RUNE_STRIKE_TALENT.icon)
            .actual(`${formatPercentage(this.cooldownReductionEfficiency)}% cooldown reduction used`)
            .recommended(`${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RUNE_STRIKE_TALENT.id} />}
        value={`${formatPercentage(this.goodCastEfficiency)}%`}
        label="good casts"
        tooltip={`
          ${formatDuration(this.wastedReduction / 1000)} wasted cooldown reduction<br/>
          ${formatDuration(this.effectiveReduction / 1000)} effective cooldown reduction<br/><br/>

          ${this.goodCasts} good casts with less than ${ONLY_CAST_BELOW_RUNES} runes available, ${this.badCasts} with more than ${ONLY_CAST_BELOW_RUNES} runes available.<br/>
          Avoid casting ${SPELLS.RUNE_STRIKE_TALENT.name} with more than ${ONLY_CAST_BELOW_RUNES} runes available, doing so would refill an already charging rune.
        `}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default RuneStrike;
