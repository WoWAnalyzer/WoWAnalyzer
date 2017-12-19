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

  suggestions(when) {
    const suggestedThreshold = this.suggestionThreshold;
    const maxTargets = this.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? 5 : 4;
    when(suggestedThreshold.actual).isLessThan(suggestedThreshold.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to always cast <SpellLink id={SPELLS.CHAIN_HEAL.id} /> on groups of people, so that it heals all {maxTargets} potential targets.</span>)
          .icon(SPELLS.CHAIN_HEAL.icon)
          .actual(`${suggestedThreshold.actual.toFixed(2)} average targets healed`)
          .recommended(`${suggestedThreshold.isLessThan.minor} average targets healed`)
          .regular(suggestedThreshold.isLessThan.average).major(suggestedThreshold.isLessThan.major);
      });
  }

  get suggestionThreshold(){
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);
    
    const casts = chainHeal.casts || 0;
    const hits = chainHeal.healingHits || 0;
    const avgHits = hits / casts;
    
    const maxTargets = this.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? 5 : 4;
    const suggestedTargets = maxTargets * CHAIN_HEAL_TARGET_EFFICIENCY;

    return {
      actual: avgHits,
      isLessThan: {
        minor: suggestedTargets,//Missed 1 target
        average: suggestedTargets-1,//Missed 2-3 targets
        major: suggestedTargets-2,//Missed more than 3 targets
      },
      style: 'number',
    };
        
  }
  statistic() {
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);
    
    const casts = chainHeal.casts || 0;
    const hits = chainHeal.healingHits || 0;
    const avgHits = hits / casts;
    
    const maxTargets = this.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? 5 : 4;

    return (
        <StatisticBox
            icon={<SpellIcon id={SPELLS.CHAIN_HEAL.id} />}
            value={`${avgHits.toFixed(2)}`}
            label={(
                <dfn data-tip={`The average percentage of targets healed by Chain Heal out of the maximum amount of targets. You cast a total of ${casts} Chain Heals, which healed an average of ${avgHits.toFixed(2)} out of ${maxTargets} targets.`}>
                    Average Chain Heal targets
                </dfn>
            )}
        />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);
}

export default ChainHeal;

