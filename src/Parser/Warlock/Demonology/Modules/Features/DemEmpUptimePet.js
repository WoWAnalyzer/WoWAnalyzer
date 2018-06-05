import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import {formatPercentage} from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from 'Main/StatisticBox';

import SPELLS from 'common/SPELLS';
import Pets from 'Parser/Core/Modules/Pets';


const DE_DURATION = 12;
const MILLISECONDS = 1000;

class DemEmpUptimePet extends Analyzer{
  static dependencies = {
    combatants : Combatants,
    pets: Pets,
  };

  totalMainPetTime = 0;
  lastDemEmpTimestamp = null;

  get uptime(){
    return (this.totalMainPetTime/this.owner.fightDuration);
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

  on_toPlayer_applybuff(event){
    const spellId = event.ability.guid;
    if(event.prepull && spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      //Player may have pre-buffed their pet.
      this.lastDemEmpTimestamp = this.owner.fight.start_time;
    }
  }

  on_byPlayer_cast(event){
    // We're making the assumption that the player has their permament pet active.
    // Which as a Demonology warlock, we really hope is a reasonable assumption.
    const spellId = event.ability.guid;
    if(spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      if(this.lastDemEmpTimestamp === null){
        this.lastDemEmpTimestamp = event.timestamp;
      }
      const deOverlap = Math.max(0, this.lastDemEmpTimestamp + (DE_DURATION * MILLISECONDS) - event.timestamp);
      const endOverlap = Math.max(0, (event.timestamp - this.owner.fight.end_time));
      const delta = (DE_DURATION * MILLISECONDS) - deOverlap - endOverlap;
      this.totalMainPetTime += delta;
      this.lastDemEmpTimestamp = event.timestamp;
    }
  }

  suggestions(when){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your pet's <SpellLink id={SPELLS.DEMONIC_EMPOWERMENT.id} icon/> uptime can be improved.
          On your permament pet, this should be up nearly 100% of the time.</React.Fragment>)
          .icon(SPELLS.DEMONIC_EMPOWERMENT.icon)
          .actual(`${formatPercentage(actual)}% uptime.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic(){
    return(
      <StatisticBox icon={<SpellIcon id={SPELLS.DEMONIC_EMPOWERMENT.id}/>} value={`${formatPercentage(this.uptime)} %`} label={'Main Pet Demonic Empowerment Uptime'} />
    );
  }

}

export default DemEmpUptimePet;
