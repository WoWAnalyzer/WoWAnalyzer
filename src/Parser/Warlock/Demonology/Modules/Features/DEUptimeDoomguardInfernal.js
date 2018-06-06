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

class DEUptimeDoomguardInfernal extends Analyzer{
  last_summon = {start: null, end: null};
  last_de = {start: null, end: null};
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
      this.last_summon.start = event.timestamp;
      this.last_summon.end = this.last_summon.start + (SUMMON_DURATION * MILLISECONDS);
    } else if (spellId === SPELLS.DEMONIC_EMPOWERMENT.id && ((this.last_summon.start || 0) <= event.timestamp && (this.last_summon.end || 0) >= event.timestamp)){
      if((this.last_de.end || event.timestamp) < event.timestamp){
        // We aren't overlapping buffs, we add the time from the last interval and start to build our next one.
        this.total_empowered_time += this.last_de.end - this.last_de.start;
        this.last_de.start = null;
        this.last_de.end = null;
      }
      this.last_de.start = (this.last_de.start || event.timestamp);
      this.last_de.end = (this.last_de.end === null ? this.last_de.start + (DE_DURATION * MILLISECONDS) : this.last_de.end + (DE_DURATION * MILLISECONDS));
      if(this.last_de.end > this.last_summon.end){
        //Our buff reaches the end of our current summon, so we add the time from this interval and reset.
        this.last_de.end = this.last_summon.end;
        this.total_empowered_time += this.last_de.end - this.last_de.start;
        this.last_de.start = this.last_de.end = this.last_summon.start = this.last_summon.end = null;
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

export default DEUptimeDoomguardInfernal;
