import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import {formatPercentage} from 'common/format';

const IMP_DURATION = 12;
const CALL_DREADSTALKERS_DURATION = 12;
const MILLISECONDS = 1000;

class DemonicEmpowermentUptimeHandOfGuldanCallDreadstalkers extends Analyzer{
  unempoweredHogs = [];
  unempoweredDreadstalkers = [];
  callDreadCasts = 0;
  hogCasts = 0;
  totalEmpoweredHogTime = 0;
  totalEmpoweredDreadTime = 0;

  get hogEmpoweredUptime(){
    return this.totalEmpoweredHogTime / (this.hogCasts * IMP_DURATION * MILLISECONDS);
  }

  get callDreadstalkersEmpoweredUptime(){
    return this.totalEmpoweredDreadTime / (this.callDreadCasts * CALL_DREADSTALKERS_DURATION * MILLISECONDS);
  }

  get hogSuggestionThresholds(){
    return {
      actual: this.hogEmpoweredUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  get dreadstalkerSuggestionThresholds(){
    return {
      actual: this.callDreadstalkersEmpoweredUptime,
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
    if(spellId === SPELLS.HAND_OF_GULDAN_CAST.id) {
      this.hogCasts += 1;
      this.unempoweredHogs.push(event.timestamp);
    }else if(spellId === SPELLS.CALL_DREADSTALKERS.id){
      this.callDreadCasts += 1;
      this.unempoweredDreadstalkers.push(event.timestamp);
    } else if (spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      this.unempoweredHogs.forEach((e) => {
        if(event.timestamp - e <= IMP_DURATION * MILLISECONDS){
          const time_delta = (IMP_DURATION * MILLISECONDS) - (event.timestamp - e);
          this.totalEmpoweredHogTime += time_delta;
        }
      });
      this.unempoweredDreadstalkers.forEach((e) => {
        if(event.timestamp - e <= (CALL_DREADSTALKERS_DURATION * MILLISECONDS)){
          const time_delta = (CALL_DREADSTALKERS_DURATION * MILLISECONDS) - (event.timestamp - e);
          this.totalEmpoweredDreadTime += time_delta;
        }
      });
      this.unempoweredHogs = [];
      this.unempoweredDreadstalkers = [];
    }
  }

  suggestions(when){
    when(this.hogSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>Empowerment of <SpellLink id={SPELLS.HAND_OF_GULDAN_CAST.id} icon/> can be improved. Remember to always empower demons immediately after summoning.</React.Fragment>
        ).icon(SPELLS.HAND_OF_GULDAN_CAST.icon)
          .actual(`${formatPercentage(actual)}% empowered uptime.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`);
      });

    when(this.dreadstalkerSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>Your empowerment uptime of <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} icon/> is low. Remember to always empower demons immediately after summoning.</React.Fragment>
        ).icon(SPELLS.CALL_DREADSTALKERS.icon)
          .actual(`${formatPercentage(actual)}% empowered uptime.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`);
      });
  }

}

export default DemonicEmpowermentUptimeHandOfGuldanCallDreadstalkers;
