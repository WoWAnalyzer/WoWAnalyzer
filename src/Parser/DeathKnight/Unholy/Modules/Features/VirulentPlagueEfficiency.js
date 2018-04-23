import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Enemies from 'Parser/Core/Modules/Enemies';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

class VirulentPlagueEfficiency extends Analyzer {
  static dependencies = {
    combatants: Combatants,
	enemies: Enemies,
  };
  
  targets = {};
  
  totalOutBreakCasts = 0;
  totalTimeWasted = 0;
  
  get VirulentDuration(){
	  if (this.combatants.selected.hasTalent(SPELLS.EBON_FEVER_TALENT.id)) {
		  return(13.65);
	  } else{
		  return(27.3);
	  }
  }
  
  on_byPlayer_refreshdebuff(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.VIRULENT_PLAGUE.id){
		  this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + 1000*this.VirulentDuration;
	  }
  }
  
   on_byPlayer_applydebuff(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.VIRULENT_PLAGUE.id){
		  this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + 1000*this.VirulentDuration - 1000*0.3*this.VirulentDuration;
		  //Removing 3.15 seconds when buff is only applied. This is for cases when the target does not benefit from the epidemic effect (Dots spreading to adds not staying by target for instance.)
	  }
  }
  

  
  on_byPlayer_cast(event) {
	  const spellID = event.ability.guid;
	  if(spellID === SPELLS.OUTBREAK.id){	
		  this.totalOutBreakCasts += 1;
		  if (this.targets[encodeTargetString(event.targetID, event.targetInstance)]) {
		  	//We subtract 6 seconds from the total duration since this is the time left after Outbreak finishes.
			  if (((this.targets[encodeTargetString(event.targetID, event.targetInstance)]) - event.timestamp) >= 0) {
			  	this.totalTimeWasted += ((this.targets[encodeTargetString(event.targetID, event.targetInstance)]) - event.timestamp) / 1000;
			  }	
		  }
	  }  
  }
 
  get averageTimeWasted(){
    return(this.totalTimeWasted/this.totalOutBreakCasts);
  }
  
  get suggestionThresholds() {
    return {
      actual: this.averageTimeWasted,
      isGreaterThan: {
        minor: (1),
        average: (3),
        major: (5),
      },
      style: 'number',
      suffix: 'Average',
    };
  }
 

  suggestions(when) {
    when(this.suggestionThresholds)
 		  .addSuggestion((suggest, actual, recommended) => {
			return suggest(<React.Fragment> You are casting <SpellLink id={SPELLS.VIRULENT_PLAGUE.id}/> too often. Try to cast <SpellLink id={SPELLS.VIRULENT_PLAGUE.id}/> as close to it falling off as possible.</React.Fragment>)
				.icon(SPELLS.VIRULENT_PLAGUE.icon)
				.actual(`${(this.averageTimeWasted).toFixed(1)} seconds of Virulent Plague uptime was wasted on average for each cast of Outbreak`)
				.recommended(`<${recommended} is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIRULENT_PLAGUE.id} />}
        value={`${(this.averageTimeWasted).toFixed(1)} seconds`}
        label={'Average Virulent Plague Duration Waste'}
		tooltip={`A total amount of ${this.totalTimeWasted.toFixed(1)} seconds of Virulent Plague uptime was wasted with an average amount of ${(this.averageTimeWasted).toFixed(1)} seconds per cast`}
      />
    );
  }
    statisticOrder = STATISTIC_ORDER.CORE(7);
}


export default VirulentPlagueEfficiency;
