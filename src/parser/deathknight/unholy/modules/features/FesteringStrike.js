import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Combatants from 'parser/shared/modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class FesteringStrike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combantants: Combatants,
  };

  // used to track how many stacks a target has
  targets = {};

  totalFesteringStrikeCasts = 0;
  festeringStrikeCastsOverThreeStacks = 0;

  on_byPlayer_applydebuffstack(event){
    // we only need to look at events applying stacks after the first one, our analysis only cares about times when stacks are >3
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
      this.targets[event.targetID] = event.stack;
    }
  }

  on_byPlayer_removedebuffstack(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
      this.targets[event.targetID] = event.stack;
    }
  }

  on_byPlayer_removedebuff(event){
    // keeps track of when the debuff drops off, useful for multitarget targets like DI
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
      this.targets[event.targetID] = 0;
    }
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_STRIKE.id){
      this.totalFesteringStrikeCasts++;
      if(this.targets.hasOwnProperty(event.targetID)){
        const currentTargetWounds = this.targets[event.targetID];
        if(currentTargetWounds > 3){
          this.festeringStrikeCastsOverThreeStacks++;
        }
      }
    }
  }

  suggestions(when) {
    const percentCastsOverThreeStacks = this.festeringStrikeCastsOverThreeStacks/this.totalFesteringStrikeCasts;
    const strikeEfficiency = 1 - percentCastsOverThreeStacks;
    when(strikeEfficiency).isLessThan(0.60)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.FESTERING_STRIKE.id} /> too often.  When spending runes remember to cast <SpellLink id={SPELLS.SCOURGE_STRIKE.id} /> instead on targets with more than three stacks of <SpellLink id={SPELLS.FESTERING_WOUND.id} /></span>)
            .icon(SPELLS.FESTERING_STRIKE.icon)
            .actual(`${formatPercentage(actual)}% of Festering Strikes did not risk overcapping Festering Wounds`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.30).major(recommended - 0.40);
        });
  }

  statistic() {
    const percentCastsOverThreeStacks = this.festeringStrikeCastsOverThreeStacks/this.totalFesteringStrikeCasts;
    const strikeEfficiency = 1 - percentCastsOverThreeStacks;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FESTERING_STRIKE.id} />}
        value={`${formatPercentage(strikeEfficiency)} %`}
        label="Festering Strike Efficiency"
        tooltip={`${this.festeringStrikeCastsOverThreeStacks} Festering Strikes were cast on a target with more than three stacks of Festering Wounds.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default FesteringStrike;
