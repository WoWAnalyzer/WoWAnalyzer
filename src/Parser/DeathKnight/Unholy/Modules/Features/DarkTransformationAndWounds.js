import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import Wrapper from 'common/Wrapper';

class DarkTransformationAndWounds extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  // used to track how many stacks a target has
  targets = {};

  darkTransformationActive = 0;
  darkTransformationCasts = 0;
  stopWatchActive = 0;
  stopWatch = 0;
  totalTime = 0;
  
  
  on_byPlayer_applybuff(event){
	  const spellId = event.ability.guid;
	  if(spellId === SPELLS.DARK_TRANSFORMATION.id){
		  this.darkTransformationActive = 1;
		  this.darkTransformationCasts += 1;
	  }
  }
  
  on_byPlayer_removebuff(event){
	  const spellId = event.ability.guid;
	  if(spellId === SPELLS.DARK_TRANSFORMATION.id){
		  this.darkTransformationActive = 0;
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
    if(this.targets.hasOwnProperty(encodeTargetString(event.targetID, event.targetInstance))) {
	    if (this.targets[encodeTargetString(event.targetID, event.targetInstance)] === 0) {
		    if (this.darkTransformationActive === 1) {
			    if (this.stopWatchActive === 0) {
				    this.stopWatch = event.timestamp;
				    this.stopWatchActive = 1;
			    }
		    } 
		    else if (this.stopWatchActive === 1) {
			    this.totalTime += (event.timestamp - this.stopWatch) / 1000;
			    this.stopWatchActive = 0;
		    }
	    } 
	    else if (this.stopWatchActive === 1) {
		    this.totalTime += (event.timestamp - this.stopWatch) / 1000;
		    this.stopWatchActive = 0;
		}
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
			return suggest(<Wrapper> You spend too much time with 0 <SpellLink id={SPELLS.FESTERING_WOUND.id}/> on your target and <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> active. Try to always keep at least 1 stack of <SpellLink id={SPELLS.FESTERING_WOUND.id}/> on the target when <SpellLink id={SPELLS.DARK_TRANSFORMATION.id}/> is active. </Wrapper>)
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
