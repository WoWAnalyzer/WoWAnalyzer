import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatDuration, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import StatTracker from 'parser/core/modules/StatTracker';
import FuriousSlashTimesByStacks from '../Talents/FuriousSlashTimesByStacks';

class FuriousSlashUptime extends Analyzer {
	static dependencies = {
    statTracker: StatTracker,
    furiousSlashTimesByStacks: FuriousSlashTimesByStacks,
  };
  
  	constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FURIOUS_SLASH_TALENT.id);
    }
  
  get furiousSlashTimesByStack(){
	  return this.furiousSlashTimesByStacks.furiousSlashTimesByStacks;
  }
  
  get maxStackUptime(){
	  const stacks = Object.values(this.furiousSlashTimesByStack).map((e, i) => e.reduce((a, b) => a + b, 0));
	  return stacks[stacks.length - 1];
	  //find the highest stack count possible, and return the uptime at that amount of stacks
  }
  
  get uptimeSuggestionThresholds(){
	  return{
		  actual: (this.maxStackUptime / this.owner.fightDuration),
		  isLessThan:{
			  minor: 0.95,
			  average: 0.9,
			  major: 0.85,
		  },
		  style: 'percentage',
	  };
  }
  
  suggestions(when){
		  when(this.uptimeSuggestionThresholds)
		  .addSuggestion((suggest, actual, recommended) => {return suggest(<React.Fragment>Your <SpellLink id={SPELLS.FURIOUS_SLASH_TALENT.id} /> uptime can be improved. Try to keep the Furious Slash buff at maximum stacks.</React.Fragment>)
		  .icon(SPELLS.FURIOUS_SLASH_TALENT.icon)
		  .actual(`${formatPercentage(actual)}% Furious Slash Uptime At Maximum Stacks`)
		  .recommended(`>${formatPercentage(recommended)} is recommended`);
		  });
  }
  
  statistic() {
	  return (
	  <ExpandableStatisticBox icon={<SpellIcon id={SPELLS.FURIOUS_SLASH_TALENT.id} />} value={`${formatPercentage(this.maxStackUptime / this.owner.fightDuration)}%`} label="Furious Slash Max Stack Buff Uptime">
	  
	    <table className="table table-condensed">
            <thead>
              <tr>
                <th>Stacks</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
			{Object.values(this.furiousSlashTimesByStack).map((e, i) => (
                <tr key={i}>
                  <th>{i}</th>
                  <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                  <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ExpandableStatisticBox>
		
		);
  }
  statisticOrder = STATISTIC_ORDER.CORE(59); //4 IS A PLACEHOLDER VALUE!
}

export default FuriousSlashUptime;
