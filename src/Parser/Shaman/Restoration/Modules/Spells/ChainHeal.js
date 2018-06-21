import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const CHAIN_HEAL_TARGET_EFFICIENCY = 0.97;

class ChainHeal extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.maxTargets = this.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? 5 : 4;
    this.suggestedTargets = this.maxTargets * CHAIN_HEAL_TARGET_EFFICIENCY;
  }

  suggestions(when) {
    const suggestedThreshold = this.suggestionThreshold;
    if (isNaN(suggestedThreshold.actual)) {
      return;
    }

    when(suggestedThreshold.actual).isLessThan(suggestedThreshold.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to always cast <SpellLink id={SPELLS.CHAIN_HEAL.id} /> on groups of people, so that it heals all {this.maxTargets} potential targets.</span>)
          .icon(SPELLS.CHAIN_HEAL.icon)
          .actual(`${suggestedThreshold.actual.toFixed(2)} average targets healed`)
          .recommended(`${suggestedThreshold.isLessThan.minor} average targets healed`)
          .regular(suggestedThreshold.isLessThan.average).major(suggestedThreshold.isLessThan.major);
      });
  }

  get avgHits() {
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);
    const casts = chainHeal.casts || 0;
    const hits = chainHeal.healingHits || 0;
    return hits / casts || 0;
  }

  get casts() {
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);
    return chainHeal.casts || 0;
  }

  get suggestionThreshold() {
    return {
      actual: this.avgHits,
      isLessThan: {
        minor: this.suggestedTargets,//Missed 1 target
        average: this.suggestedTargets - 1,//Missed 2-3 targets
        major: this.suggestedTargets - 2,//Missed more than 3 targets
      },
      style: 'number',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CHAIN_HEAL.id} />}
        value={this.avgHits.toFixed(2)}
        label={(
          <dfn data-tip={`The average number of targets healed by Chain Heal out of the maximum amount of targets. You cast a total of ${this.casts} Chain Heals, which healed an average of ${this.avgHits.toFixed(2)} out of ${this.maxTargets} targets.`}>
            Average Chain Heal targets
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);
}

export default ChainHeal;
