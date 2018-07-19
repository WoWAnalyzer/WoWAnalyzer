import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import FuriousSlashTimesByStacks from '../Talents/FuriousSlashTimesByStacks';

class FuriousSlash extends Analyzer {
	static dependencies = {
    statTracker: StatTracker,
    furiousSlashTimesByStacks: FuriousSlashTimesByStacks,
  };
  
  get furiousSlashTimesByStack(){
	  return this.furiousSlashTimesByStacks.furiousSlashTimesByStacks;
  }
  
  get maxStackUptime(){
	  return this.furiousSlashTimesByStacks.furiousSlashTimesByStacks[this.furiousSlashTimesByStacks.furiousSlashTimesByStacks.length - 1]; 
	  //find the highest stack count possible, and return the uptime at that amount of stacks
  }
  
  statistic() {
	  return (
	  <ExpandableStatisticBox 
	  icon={<SpellIcon.id={SPELLS.FURIOUS_SLASH_TALENT.id} />}
	  value={'${formatPercentage(this.maxStackUptime)} %'}
	  label="Furious Slash Max Stack Buff Uptime"
	  >
	  
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
		statisticOrder = STATISTIC_ORDER.CORE(0); //0 IS A PLACEHOLDER VALUE!
  }
  
  export default FuriousSlash;
}