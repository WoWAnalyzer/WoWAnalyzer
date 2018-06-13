import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';

const MILLISECONDS = 1000;

const DE_DURATION_MS = 12 * MILLISECONDS;
const CD_DEMON_SUMMON_DURATION_MS = 25 * MILLISECONDS;
const HOG_IMP_DURATION_MS = 12 * MILLISECONDS;
const CALL_DREADSTALKERS_DURATION_MS = 12 * MILLISECONDS;

class DemonicEmpowerment extends Analyzer{
  hogCasts = 0;
  callDreadCasts = 0;
  cdSummonCasts = 0;

  lastDeStart = null;

  unempoweredDreadstalkers = [];
  unempoweredHogImps = [];


  totalEmpPetTime = 0;
  totalEmpCallDreadTime = 0;
  totalEmpCdDemonTime = 0;
  totalEmpHogImpTime = 0;

  lastCDSummonStart = null;
  lastCDSummonEnd = null;
  lastDeIntervalStart = null;
  lastDeIntervalEnd = null;

  get hogEmpoweredUptime(){
    return this.totalEmpHogImpTime / (this.hogCasts * HOG_IMP_DURATION_MS);
  }

  get callDreadStalkersEmpoweredUptime(){
    return this.totalEmpCallDreadTime / (this.callDreadCasts * CALL_DREADSTALKERS_DURATION_MS);
  }

  get petEmpoweredUptime(){
    return this.totalEmpPetTime / (this.owner.fightDuration);
  }

  get cdDemonEmpoweredUptime(){
    return this.totalEmpCdDemonTime / (this.cdSummonCasts * CD_DEMON_SUMMON_DURATION_MS);
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

  get callDreadstalkerSuggestionThresholds(){
    return {
      actual: this.callDreadStalkersEmpoweredUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  get petSuggestionThresholds(){
    return {
      actual: this.petEmpoweredUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  get cdDemonSuggestionThresholds(){
    return {
      actual: this.cdDemonEmpoweredUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }


  on_toPlayer_applyBuff(event){
    const spellId = event.ability.guid;
    if(event.prepull && spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      //Player may have pre-buffed their pet.
      this.lastDeStart = this.owner.fight.start_time;
    }
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.DEMONIC_EMPOWERMENT.id){
      if(this.lastDeStart === null){
        this.lastDeStart = event.timestamp;
      }
      this.updateHogUptime(event);
      this.updateDreadstalkerUptime(event);
      this.updatePetUptime(event);
      this.updateCdDemonUptime(event);
      this.lastDeStart = event.timestamp;
    } else if(spellId === SPELLS.HAND_OF_GULDAN_CAST.id){
      this.hogCasts += 1;
      this.unempoweredHogImps.push(event.timestamp);
    } else if(spellId === SPELLS.CALL_DREADSTALKERS.id){
      this.callDreadCasts += 1;
      this.unempoweredDreadstalkers.push(event.timestamp);
    } else if (spellId === SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id || spellId === SPELLS.SUMMON_INFERNAL_UNTALENTED.id){
      this.cdSummonCasts += 1;
      this.lastCDSummonStart = event.timestamp;
      this.lastCDSummonEnd = this.lastCDSummonStart + (CD_DEMON_SUMMON_DURATION_MS);
    }

  }

  updateHogUptime(event){
    this.unempoweredHogImps.forEach((e) => {
      if(event.timestamp - e <= HOG_IMP_DURATION_MS){
        const timeDelta = (HOG_IMP_DURATION_MS) - (event.timestamp - e);
        this.totalEmpHogImpTime += timeDelta;
      }
    });
    this.unempoweredHogImps = [];
  }

  updateDreadstalkerUptime(event){
    this.unempoweredDreadstalkers.forEach((e) => {
      if(event.timestamp - e <= CALL_DREADSTALKERS_DURATION_MS){
        const timeDelta = (CALL_DREADSTALKERS_DURATION_MS) - (event.timestamp - e);
        this.totalEmpCallDreadTime += timeDelta;
      }
    });
    this.unempoweredDreadstalkers = [];
  }

  updatePetUptime(event){
    const deOverlap = Math.max(0, this.lastDeStart + (DE_DURATION_MS) - event.timestamp);
    const endOverlap = Math.max(0, event.timestamp - this.owner.fight.end_time);
    const timeDelta = (DE_DURATION_MS) - deOverlap - endOverlap;
    this.totalEmpPetTime += timeDelta;
  }

  updateCdDemonUptime(event){
    if((this.lastCDSummonStart || 0) <= event.timestamp && (this.lastCDSummonEnd || 0) >= event.timestamp){
      if((this.lastDeIntervalEnd || event.timestamp) < event.timestamp){
        // We aren't overlapping buffs, we add the time from the last interval and start to build our next one.
        this.totalEmpCdDemonTime += this.lastDeIntervalEnd - this.lastDeIntervalStart;
        this.lastDeIntervalStart = null;
        this.lastDeIntervalEnd = null;
      }
      this.lastDeIntervalStart = (this.lastDeIntervalStart || event.timestamp);
      this.lastDeIntervalEnd = (this.lastDeIntervalEnd == null ? this.lastDeIntervalStart + (DE_DURATION_MS) : this.lastDeIntervalEnd + (DE_DURATION_MS));
      if(this.lastDeIntervalEnd > this.lastCDSummonEnd){
        //Our buff reaches the end of our current summon, so we add the time from this interval and reset.
        this.lastDeIntervalEnd = this.lastCDSummonEnd;
        this.totalEmpCdDemonTime += this.lastDeIntervalEnd - this.lastDeIntervalStart;
        this.lastDeIntervalStart = this.lastDeIntervalEnd = this.lastCDSummonStart = this.lastCDSummonEnd = null;
      }
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

    when(this.callDreadstalkerSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>Your empowerment uptime of <SpellLink id={SPELLS.CALL_DREADSTALKERS.id} icon/> is low. Remember to always empower demons immediately after summoning.</React.Fragment>
        ).icon(SPELLS.CALL_DREADSTALKERS.icon)
          .actual(`${formatPercentage(actual)}% empowered uptime.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended.`);
      });

    when(this.petSuggestionThresholds)
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
      <StatisticBox icon={<SpellIcon id={SPELLS.DEMONIC_EMPOWERMENT.id}/>} value={`${formatPercentage(this.petEmpoweredUptime)} %`} label='Main Pet Demonic Empowerment Uptime' />
    );
  }

}

export default DemonicEmpowerment;
