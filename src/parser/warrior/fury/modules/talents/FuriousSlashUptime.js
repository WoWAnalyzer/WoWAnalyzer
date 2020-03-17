import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatDuration, formatPercentage, formatNumber } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticBox from 'interface/others/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import FuriousSlashTimesByStacks from './FuriousSlashTimesByStacks';

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
  
  get numberTimesDropped(){
    return this.furiousSlashTimesByStack[0].length-1;
  }

  get uptime(){
    const stacks = Object.values(this.furiousSlashTimesByStack).map((e, i) => e.reduce((a, b) => a + b, 0));
    stacks.shift();
    let value = 0;
    stacks.forEach(function(i){
      value += i;
    });
	  return value;
	  //find the highest stack count possible, and return the uptime at that amount of stacks
  }
  
  get uptimeSuggestionThresholds(){
	  return{
		  actual: this.numberTimesDropped,
		  isGreaterThan:{
			  minor: 0,
			  average: 1,
			  major: 2,
		  },
		  style: 'number',
	  };
  }
  
  suggestions(when){
		  when(this.uptimeSuggestionThresholds)
		  .addSuggestion((suggest, actual, recommended) => {
return suggest(<>You dropped <SpellLink id={SPELLS.FURIOUS_SLASH_TALENT.id} /> multiply times throughout the fight. This can be improved.</>)
		  .icon(SPELLS.FURIOUS_SLASH_TALENT.icon)
		  .actual(`${formatNumber(actual)} times Furious Slash dropped`)
		  .recommended(`${formatNumber(recommended)} is recommended`);
		  });
  }
  
  statistic() {
	  return (
	  <StatisticBox icon={<SpellIcon id={SPELLS.FURIOUS_SLASH_TALENT.id} />} value={`${formatPercentage(this.uptime / this.owner.fightDuration)}%`} label="Furious Slash Stack Buff Uptime">
	  
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
        </StatisticBox>
		
		);
  }
  statisticOrder = STATISTIC_ORDER.CORE(59); //4 IS A PLACEHOLDER VALUE!
}

export default FuriousSlashUptime;
