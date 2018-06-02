import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const CALL_DREADSTALKERS_DURATION = 12;
const MILLISECONDS = 1000;

class DemEmpUptimeDreadstalkers extends Analyzer{
  totalEmpoweredTime = 0;
  unempoweredDreadstalkers = [];
  callDreadstalkersCasts = 0;

  get uptime(){
    return this.totalEmpoweredTime / (this.callDreadstalkersCasts * CALL_DREADSTALKERS_DURATION * MILLISECONDS);
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

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.CALL_DREADSTALKERS.id){
      this.unempoweredDreadstalkers.push(event.timestamp);
      this.callDreadstalkersCasts += 1;
    } else if(spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      for(const dread of this.unempoweredDreadstalkers){
        if(event.timestamp - dread <= (CALL_DREADSTALKERS_DURATION * MILLISECONDS)){
          const timeDelta = (CALL_DREADSTALKERS_DURATION * MILLISECONDS) - (event.timestamp-dread);
          this.totalEmpoweredTime += timeDelta;
        }
      }
      this.unempoweredDreadstalkers = [];
    }
  }

  suggestions(when){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>Empowerment of <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} icon/> can be improved. Remember to always empower demons immediately after summoning.</React.Fragment>
        ).icon(SPELLS.CALL_DREADSTALKERS.icon)
          .actual(`${formatPercentage(actual)}% empowered uptime.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic(){
    return(
      <StatisticBox icon={<SpellIcon id={SPELLS.CALL_DREADSTALKERS.id}/>} value={`${formatPercentage(this.uptime)} %`} label={'Empowered Dreadstalker Uptime'} />
    );
  }


}

export default DemEmpUptimeDreadstalkers;
