import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ScourgeStrike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combantants: Combatants,
  };

  // used to track how many stacks a target has
  targets = {};

  totalScourgeStrikeCasts = 0;
  scourgeStrikeCastsZeroWounds = 0;

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
    if(spellId === SPELLS.SCOURGE_STRIKE.id){
      this.totalScourgeStrikeCasts++;
      if(this.targets.hasOwnProperty(event.targetID)){
        const currentTargetWounds = this.targets[event.targetID];
        if(currentTargetWounds = 4){
          this.scourgeStrikeCastsZeroWounds++;
        }
      }
    }
  }

  suggestions(when) {
    const percentCastZeroWounds = this.scourgeStrikeCastsZeroWounds/this.totalScourgeStrikeCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    when(strikeEfficiency).isLessThan(0.60)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.SCOURGE_STRIKE.id}/> too often.  When spending runes remember to cast <SpellLink id={SPELLS.FESTERING_STRIKE.id}/> instead on targets with no stacks of <SpellLink id={SPELLS.FESTERING_WOUND.id}/></span>)
            .icon(SPELLS.SCOURGE_STRIKE.icon)
            .actual(`${formatPercentage(actual)}% of Scourge Strikes were used with Wounds on the target`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.30).major(recommended - 0.40);
        });
  }

  statistic() {
    const percentCastZeroWounds = this.scourgeStrikeCastsZeroWounds/this.totalScourgeStrikeCasts;
    const strikeEfficiency = 1 - percentCastZeroWounds;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SCOURGE_STRIKE.id} />}
        value={`${formatPercentage(strikeEfficiency)} %`}
        label={'Scourge Strike Efficiency'}
        tooltip={`${formatPercentage(percentCastsOverFourStacks)}% of Scourge Strikes were used with Wounds on the target.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(9);
}
