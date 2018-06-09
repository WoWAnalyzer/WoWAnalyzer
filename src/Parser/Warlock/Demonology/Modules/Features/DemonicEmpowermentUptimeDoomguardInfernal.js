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

class DemonicEmpowermentUptimeDoomguardInfernal extends Analyzer{
  lastSummonStart = null;
  lastSummonEnd = null;
  lastDeStart = null;
  lastDeEnd = null;
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
      this.lastSummonStart = event.timestamp;
      this.lastSummonEnd = this.lastSummonStart + (SUMMON_DURATION * MILLISECONDS);
    } else if (spellId === SPELLS.DEMONIC_EMPOWERMENT.id && ((this.lastSummonStart || 0) <= event.timestamp && (this.lastSummonEnd || 0) >= event.timestamp)){
      if((this.lastDeEnd || event.timestamp) < event.timestamp){
        // We aren't overlapping buffs, we add the time from the last interval and start to build our next one.
        this.totalEmpoweredTime += this.lastDeEnd - this.lastDeStart;
        this.lastDeStart = null;
        this.lastDeEnd = null;
      }
      this.lastDeStart = (this.lastDeStart || event.timestamp);
      this.lastDeEnd = (this.lastDeEnd === null ? this.lastDeStart + (DE_DURATION * MILLISECONDS) : this.lastDeEnd + (DE_DURATION * MILLISECONDS));
      if(this.lastDeEnd > this.lastSummonEnd){
        //Our buff reaches the end of our current summon, so we add the time from this interval and reset.
        this.lastDeEnd = this.lastSummonEnd;
        this.totalEmpoweredTime += this.lastDeEnd - this.lastDeStart;
        this.lastDeStart = this.lastDeEnd = this.lastSummonStart = this.lastSummonEnd = null;
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

export default DemonicEmpowermentUptimeDoomguardInfernal;
