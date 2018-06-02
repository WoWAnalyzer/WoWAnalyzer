import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import {formatPercentage} from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from 'Main/StatisticBox';

import SPELLS from 'common/SPELLS';

import DemoPets from '../WarlockCore/Pets';


class DemEmpUptimePet extends Analyzer{
  static dependencies = {
    combatants : Combatants,
    pets: DemoPets,
  };

  totalMainPetTime = 0;
  lastDemEmpTimestamp = null;
  demEmpCasts = 0;

  get uptime(){
    return this.totalMainPetTime / this.owner.fightDuration;
  }

  get suggestionThresholds(){
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  on_initialized(){
    if(this.combatants.selected.hasBuff(SPELLS.DEMONIC_EMPOWERMENT.id)){
      //this.lastDemEmpTimestamp = 0;
    }
  }

  on_toPlayer_applybuff(event){
    const spellId = event.ability.guid;
    if(event.prepull && spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      this.lastDemEmpTimestamp = 0;
    }
  }

  on_byPlayer_applybuff(event){
    // We're making the assumption that the player has their permament pet active.
    // Which as a Demonology warlock, we really hope is a reasonable assumption.
    const spellId = event.ability.guid;
    if(spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      this.demEmpCasts += 1;
      if(this.lastDemEmpTimestamp === null){
        this.lastDemEmpTimestamp = event.timestamp;
      } else {
        this.totalMainPetTime += Math.min(12 * 1000, (event.timestamp - this.lastDemEmpTimestamp));
        this.lastDemEmpTimestamp = event.timestamp;
      }
    }
  }

  suggestions(when){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your general <SpellLink id={SPELLS.DEMONIC_EMPOWERMENT.id} icon/> uptime can be improved.
          On your permament pet, this should be up nearly 100% of the time.</React.Fragment>)
          .icon(SPELLS.DEMONIC_EMPOWERMENT.icon)
          .actual(`${formatPercentage(actual)}% uptime.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic(){
    return(
      <StatisticBox icon={<SpellIcon id={SPELLS.DEMONIC_EMPOWERMENT.id}/>} value={`${formatPercentage(this.uptime)} %`} label={'General Demonic Empowerment Uptime'} />
    );
  }

}

export default DemEmpUptimePet;
