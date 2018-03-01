import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Enemies from 'Parser/Core/Modules/Enemies';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import Wrapper from 'common/Wrapper';

class VirulentPlagueEfficiency extends Analyzer {
  static dependencies = {
    combatants: Combatants,
	enemies: Enemies,
  };
  
  targets = {};
  
  totalOutBreakCasts = 0;
  totalVirulentDuration = 0;
  totalTimeWasted = 0;
  
  get VirulentDuration(){
	if (this.combatants.selected.hasTalent(SPELLS.EBON_FEVER_TALENT.id)) {
		return(19.65);
	} else{
		return(33.3);
	}
  }
  
  on_byPlayer_refreshdebuff(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.VIRULENT_PLAGUE.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp;
	}
  }
  
   on_byPlayer_applydebuff(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.VIRULENT_PLAGUE.id){
		this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + 1000*0.3*this.VirulentDuration;
		//Adding 3.15 seconds when buff is only applied. This is for cases when the target does not benefit from the epidemic effect (Dots spreading to adds not staying by target for instance.)
	}
  }
  

  
  on_byPlayer_cast(event) {
	const spellID = event.ability.guid;
	if(spellID === SPELLS.OUTBREAK.id){	
		this.totalOutBreakCasts += 1;
		if (this.targets[encodeTargetString(event.targetID, event.targetInstance)]) {
			//We subtract 6 seconds from the total duration since this is the time left after Outbreak finishes.
			if (((this.VirulentDuration - 6) - (event.timestamp -  this.targets[encodeTargetString(event.targetID, event.targetInstance)]) / 1000) >= 0) {
				this.totalTimeWasted += (this.VirulentDuration - 6) - (event.timestamp -  this.targets[encodeTargetString(event.targetID, event.targetInstance)]) / 1000;
			}	
		}
	}  
  }
 
    get suggestionThresholds() {
    return {
      actual: 5-(this.totalTimeWasted/(this.totalOutBreakCasts)).toFixed(1),
      isLessThan: {
        minor: (4),
        average: (2),
        major: (0),
      },
      style: 'number',
      suffix: 'Average',
    };
  }
 

  suggestions(when) {
    when(this.suggestionThresholds)
 		  .addSuggestion((suggest, actual, recommended) => {
			return suggest(<Wrapper> You are casting <SpellLink id={SPELLS.VIRULENT_PLAGUE.id}/> too often. Try to cast <SpellLink id={SPELLS.VIRULENT_PLAGUE.id}/> as close to it falling off as possible.</Wrapper>)
				.icon(SPELLS.VIRULENT_PLAGUE.icon)
				.actual(`${(this.totalTimeWasted/this.totalOutBreakCasts).toFixed(1)} seconds of Virulent Plague uptime was wasted on average for each cast of Outbreak`)
				.recommended(`<${6-(recommended)} is recommended`)
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIRULENT_PLAGUE.id} />}
        value={`${(this.totalTimeWasted/this.totalOutBreakCasts).toFixed(1)} seconds`}
        label={'Average Virulent Plague Duration Waste'}
		tooltip={`A total amount of ${this.totalTimeWasted.toFixed(1)} seconds of Virulent Plague uptime was wasted with an average amount of ${(this.totalTimeWasted/this.totalOutBreakCasts).toFixed(1)} per cast`}
      />
    );
  }
    statisticOrder = STATISTIC_ORDER.CORE(7);
}


export default VirulentPlagueEfficiency