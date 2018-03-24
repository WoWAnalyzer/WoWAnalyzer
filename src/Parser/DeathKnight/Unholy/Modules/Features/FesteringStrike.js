import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class FesteringStrike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combantants: Combatants,
  };

  // used to track how many stacks a target has
  targets = {};

  totalFesteringStrikeCasts = 0;
  festeringStrikeCastsOverFourStacks = 0;

  on_byPlayer_applydebuffstack(event){
    // we only need to look at events applying stacks after the first one, our analysis only cares about times when stacks are >4
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
        if(currentTargetWounds > 4){
          this.festeringStrikeCastsOverFourStacks++;
        }
      }
    }
  }

  suggestions(when) {
    const percentCastsOverFourStacks = this.festeringStrikeCastsOverFourStacks/this.totalFesteringStrikeCasts;
    const strikeEfficiency = 1 - percentCastsOverFourStacks;
    when(strikeEfficiency).isLessThan(0.60)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.FESTERING_STRIKE.id}/> too often.  When spending runes remember to cast <SpellLink id={SPELLS.SCOURGE_STRIKE.id}/> instead on targets with more than four stacks of <SpellLink id={SPELLS.FESTERING_WOUND.id}/></span>)
            .icon(SPELLS.FESTERING_STRIKE.icon)
            .actual(`${formatPercentage(actual)}% of Festering Strikes did not risk overcapping Festering Wounds`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.30).major(recommended - 0.40);
        });
  }

  statistic() {
    const percentCastsOverFourStacks = this.festeringStrikeCastsOverFourStacks/this.totalFesteringStrikeCasts;
    const strikeEfficiency = 1 - percentCastsOverFourStacks;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FESTERING_STRIKE.id} />}
        value={`${formatPercentage(strikeEfficiency)} %`}
        label="Festering Strike Efficiency"
        tooltip={`${this.festeringStrikeCastsOverFourStacks} Festering Strikes were cast on a target with more than four stacks of Festering Wounds.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default FesteringStrike;
