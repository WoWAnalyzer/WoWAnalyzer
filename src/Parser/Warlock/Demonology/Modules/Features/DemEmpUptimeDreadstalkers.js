import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const CALL_DREADSTALKERS_COOLDOWN = 15;
const CALL_DREADSTALKERS_DURATION = 12;
const DEMONIC_EMPOWERMENT_DURATION = 12;
const MILLISECONDS = 1000;

class DemEmpUptimeDreadstalkers extends Analyzer{
  demonicEmpowermentCount = 0;
  totalDreadstalkerTime = DEMONIC_EMPOWERMENT_DURATION * MILLISECONDS;
  lastDemEmpTimestamp = null;
  lastCallDreadstalkersTimestamp = null;
  demEmpCasts = 0;
  callDreadstalkersCasts = 0;
  lastTimeDelta = 0;

  get uptime(){
    return this.totalDreadstalkerTime / (this.callDreadstalkersCasts * CALL_DREADSTALKERS_DURATION * MILLISECONDS);
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
      this.lastCallDreadstalkersTimestamp = event.timestamp;
      this.callDreadstalkersCasts += 1;
    } else if(spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      this.demEmpCasts += 1;
      if(this.lastCallDreadstalkersTimestamp !== null &&
        event.timestamp - this.lastCallDreadstalkersTimestamp <= (CALL_DREADSTALKERS_DURATION * MILLISECONDS) &&
        event.timestamp - this.lastDemEmpTimestamp <= (DEMONIC_EMPOWERMENT_DURATION * MILLISECONDS)){
        const timeDelta = (CALL_DREADSTALKERS_COOLDOWN * MILLISECONDS) - (event.timestamp - this.lastCallDreadstalkersTimestamp);
        if(timeDelta > this.lastTimeDelta){ //Avoid adding time for empowerment refreshes.
          this.totalDreadstalkerTime += timeDelta;
        }
        this.lastTimeDelta = timeDelta;
      }
      this.lastDemEmpTimestamp = event.timestamp;
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
