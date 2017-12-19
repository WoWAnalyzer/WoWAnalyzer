import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

class Apocalypse extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  // used to track how many stacks a target has
  targets = {};

  totalApocalypseCasts = 0;
  apocalypseWoundsPopped = 0;
  
  //These three sections are for keeping track of the amount of Festering Wounds on the target
  on_byPlayer_applydebuffstack(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack;
	}
  }

  on_byPlayer_removedebuffstack(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.stack;
    }
  }

  on_byPlayer_removedebuff(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FESTERING_WOUND.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = 0;
	}
  }

  //Logic that both counts the amount of Apocalypse cast by the player, as well as the amount of wounds popped by those apocalypse.
  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.APOCALYPSE.id){
		this.totalApocalypseCasts+=1;
		if(this.targets.hasOwnProperty(encodeTargetString(event.targetID, event.targetInstance))) {
			const currentTargetWounds = this.targets[encodeTargetString(event.targetID, event.targetInstance)];
			if(currentTargetWounds > 5){
				this.apocalypseWoundsPopped=this.apocalypseWoundsPopped + 6;
				console.log(this.apocalypseWoundsPopped);
			} else {
				this.apocalypseWoundsPopped=this.apocalypseWoundsPopped + currentTargetWounds;
			}
		}
	}
  }

  suggestions(when) {
	//Takes the average amount of casts and rounds it to one decimal digit
    const averageWoundsPopped = parseFloat(Math.round(this.apocalypseWoundsPopped/this.totalApocalypseCasts*10)/10).toFixed(1);
	//Getting 6 wounds on every Apocalypse isn't difficult and should be expected
    when(averageWoundsPopped).isLessThan(6)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are casting <SpellLink id={SPELLS.APOCALYPSE.id}/> with too few <SpellLink id={SPELLS.FESTERING_WOUND.id}/> on the target. When casting <SpellLink id={SPELLS.APOCALYPSE.id}/>, make sure to have at least 6 <SpellLink id={SPELLS.FESTERING_WOUND.id}/> on the target.</span>)
            .icon(SPELLS.APOCALYPSE.icon)
            .actual(`An average ${(actual)}% of Festering Wounds were popped by Apocalypse`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 1).major(recommended - 2);
        });
  }

  statistic() {
    const averageWoundsPopped = parseFloat(Math.round(this.apocalypseWoundsPopped/this.totalApocalypseCasts*10)/10).toFixed(1);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.APOCALYPSE.id} />}
        value={`${averageWoundsPopped}`}
        label={'Average Wounds Popped with Apocalypse'}
        tooltip={`You popped ${this.apocalypseWoundsPopped} wounds with ${this.totalApocalypseCasts} casts of Apocalypse.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default Apocalypse;
