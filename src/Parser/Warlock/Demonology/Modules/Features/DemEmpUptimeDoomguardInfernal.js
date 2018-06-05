import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import {formatPercentage} from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const SUMMON_DURATION = 25;
const DE_DURATION = 12;
const MILLISECONDS = 1000;

class DemEmpUptimeDoomguardInfernal extends Analyzer{
  summon_interval = {start: null, end: null};
  last_de_interval = {start: null, end: null};
  summon_casts = 0;
  total_empowered_time = 0;

  get uptime(){
    return this.total_empowered_time / (this.summon_casts * SUMMON_DURATION * MILLISECONDS);
  }

  get suggestionThresholds(){
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.SUMMON_INFERNAL_UNTALENTED.id || spellId === SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id){
      this.summon_casts += 1;
      this.summon_interval.start = event.timestamp;
      this.summon_interval.end = this.summon_interval.start + (SUMMON_DURATION * MILLISECONDS);
    } else if (spellId === SPELLS.DEMONIC_EMPOWERMENT.id && ((this.summon_interval.start || 0) <= event.timestamp && (this.summon_interval.end || 0) >= event.timestamp)){
      if((this.last_de_interval.end || event.timestamp) < event.timestamp){
        // We aren't overlapping buffs, we add the time from the last interval and start to build our next one.
        this.total_empowered_time += this.last_de_interval.end - this.last_de_interval.start;
        this.last_de_interval.start = null;
        this.last_de_interval.end = null;
      }
      this.last_de_interval.start = (this.last_de_interval.start || event.timestamp);
      this.last_de_interval.end = (this.last_de_interval.end === null ? this.last_de_interval.start + (DE_DURATION * MILLISECONDS) : this.last_de_interval.end + (DE_DURATION * MILLISECONDS));
      if(this.last_de_interval.end > this.summon_interval.end){
        //Our buff reaches the end of our current summon, so we add the time from this interval and reset.
        this.last_de_interval.end = this.summon_interval.end;
        this.total_empowered_time += this.last_de_interval.end - this.last_de_interval.start;
        this.last_de_interval.start = this.last_de_interval.end = this.summon_interval.start = this.summon_interval.end = null;
      }
    }
  }

  suggestions(when){
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>Empowerment of <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} icon/>/<SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} icon/> can be improved. Remember to always empower demons immediately after summoning.</React.Fragment>
        ).icon(SPELLS.SUMMON_DOOMGUARD_UNTALENTED.icon)
          .actual(`${formatPercentage(actual)}% empowered uptime.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic(){
    return(
      <StatisticBox icon={<SpellIcon id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id}/>} value={`${formatPercentage(this.uptime)} %`} label={'Empowered CD Demon Uptime'} />
    );
  }
}

export default DemEmpUptimeDoomguardInfernal;
