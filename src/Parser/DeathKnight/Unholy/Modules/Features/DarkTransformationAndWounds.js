import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

class DarkTransformationAndWounds extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  // used to track how many stacks a target has
  targets = {};

  darkTransformationActive = false;
  darkTransformationCasts = 0;
  stopWatchActive = false;
  stopWatch = 0;
  totalTime = 0;
  
  
  on_byPlayer_applybuff(event){
	  const spellId = event.ability.guid;
	  if(spellId === SPELLS.DARK_TRANSFORMATION.id){
		  this.darkTransformationActive = true;
		  this.darkTransformationCasts += 1;
	  }
  }
  
  on_byPlayer_removebuff(event){
	  const spellId = event.ability.guid;
	  if(spellId === SPELLS.DARK_TRANSFORMATION.id){
		  this.darkTransformationActive = false;
	  }
  }
  
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

  on_byPlayer_cast(event){
    if(!this.targets.hasOwnProperty(encodeTargetString(event.targetID, event.targetInstance)) || this.targets[encodeTargetString(event.targetID, event.targetInstance)] === 0) {
		  if (this.darkTransformationActive === true) {
			  if (!this.stopWatchActive) {
				  this.stopWatch = event.timestamp;
				  this.stopWatchActive = true;
			  }
		  } 
		  else if (this.stopWatchActive) {
		    this.totalTime += (event.timestamp - this.stopWatch) / 1000;
			  this.stopWatchActive = false;
		  }
	  } 
    else if (this.stopWatchActive) {
		  this.totalTime += (event.timestamp - this.stopWatch) / 1000;
		  this.stopWatchActive = false;
	  }
  }
  
  get averageTimePerCast() {
	  return (this.totalTime/this.darkTransformationCasts);
  }
		  
  get suggestionThresholds() {
    return {
      actual: this.averageTimePerCast,
      isGreaterThan: {
        minor: (0.5),
        average: (1.5),
        major: (3),
      },
      style: 'number',
      suffix: 'average',
    };
  }

   suggestions(when) {
    when(this.suggestionThresholds)
 		  .addSuggestion((suggest, actual, recommended) => {
			return suggest(<React.Fragment> You spend too much time with 0 <SpellLink id={SPELLS.FESTERING_WOUND.id}/> on your target and <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> active. Try to always keep at least 1 stack of <SpellLink id={SPELLS.FESTERING_WOUND.id}/> on the target when <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> is active. </React.Fragment>)
				.icon(SPELLS.DARK_TRANSFORMATION.icon)
				.actual(`An average of ${this.averageTimePerCast.toFixed(1)} seconds was spent at 0 wounds with each cast of Dark Transformation`)
				.recommended(`<${recommended} is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DARK_TRANSFORMATION.id} />}
        value={`${this.averageTimePerCast.toFixed(1)} seconds`}
        label={'Average time spent at 0 wounds per Dark Transformation cast'}
		    tooltip={`A total amount of ${this.totalTime.toFixed(1)} seconds was spent at 0 wounds with Dark Transformation active`}
      />
    );
  }
    statisticOrder = STATISTIC_ORDER.CORE(7);
}


export default DarkTransformationAndWounds;
