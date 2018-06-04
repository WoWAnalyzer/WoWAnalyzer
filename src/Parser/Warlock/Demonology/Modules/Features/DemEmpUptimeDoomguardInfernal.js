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
  summonInterval = {start: null, end: null};
  lei = {start: null, end: null}; //lastEmpowermentInterval
  summonCasts = 0;
  totalEmpoweredTime = 0;

  get uptime(){
    return this.totalEmpoweredTime / (this.summonCasts * SUMMON_DURATION * MILLISECONDS);
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
      this.summonCasts += 1;
      this.summonInterval.start = event.timestamp;
      this.summonInterval.end = this.summonInterval.start + (SUMMON_DURATION * MILLISECONDS);
    } else if (spellId === SPELLS.DEMONIC_EMPOWERMENT.id && ((this.summonInterval.start || 0) <= event.timestamp && (this.summonInterval.end || 0) >= event.timestamp)){
      if((this.lei.end || event.timestamp) < event.timestamp){
        // We aren't overlapping buffs, we add the time from the last interval and start to build our next one.
        this.totalEmpoweredTime += this.lei.end - this.lei.start;
        this.lei.start = null;
        this.lei.end = null;
      }
      this.lei.start = (this.lei.start || event.timestamp);
      this.lei.end = (this.lei.end === null ? this.lei.start + (DE_DURATION * MILLISECONDS) : this.lei.end + (DE_DURATION * MILLISECONDS));
      if(this.lei.end > this.summonInterval.end){
        //Our buff reaches the end of our current summon, so we add the time from this interval and reset.
        this.lei.end = this.summonInterval.end;
        this.totalEmpoweredTime += this.lei.end - this.lei.start;
        this.lei.start = this.lei.end = this.summonInterval.start = this.summonInterval.end = null;
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
