import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ResourceTypes from 'common/RESOURCE_TYPES';

class LEmpowerment extends Analyzer {
  isLunarStrike(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.LUNAR_STRIKE.id;
  }
  isStarsurge(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.STARSURGE_MOONKIN.id;
  }  
  isCoolDown(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.CELESTIAL_ALIGNMENT.id || spellId === SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id;
  }

  LunarEmpsActive = 0;
  LunarEmpsOver = 0;

  CurrentAsP = 0;
  MaxAsP = 0;

  LSAsPGen = 150;

  on_byPlayer_cast(event) {

    if (!this.isLunarStrike(event) && !this.isStarsurge(event)) return;

    if (this.isLunarStrike(event) && this.LunarEmpsActive > 0){
        this.LunarEmpsActive--;
    }
    else if (this.isStarsurge(event)){
      if (this.LunarEmpsActive < 3)
        this.LunarEmpsActive++;
      else if (this.MaxAsP - this.CurrentAsP >= this.LSAsPGen)
        this.LunarEmpsOver++;
    }
  }

  on_toPlayer_energize(event) {
    if (!event.classResources) return;
    
    for (let i = 0; i < event.classResources.length; i += 1) {
      if (event.classResources[i].type === ResourceTypes.ASTRAL_POWER) {
        this.MaxAsP = event.classResources[i].max;
        this.CurrentAsP = event.classResources[i].amount;
      }
    }
  }

  on_toPlayer_applybuff(event) {
    if (this.isCoolDown) this.LSAsPGen = 220;
  }
  on_toPlayer_removebuff(event) {
    if (this.isCoolDown) this.LSAsPGen = 150;
  }
  
  suggestions(when) {
    const wastedPerMin = Math.round((((this.LunarEmpsOver) / (this.owner.fightDuration / 1000)) * 60)*10) / 10;
    when(wastedPerMin).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overcapped {this.LunarEmpsOver} Lunar Empowerments when you could have avoided it without overcapping Astral Power. Try to prioritize casting Lunar Strike over Starsurge when not near max AsP and having Lunar Empowerment stacks up.</span>)
            .icon('ability_druid_eclipse')
            .actual(`${actual} avoidable overcapped Lunar Empowerments per minute`)
            .recommended('0 is recommended.')
            .regular(recommended + 1).major(recommended + 2);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_druid_eclipse" />}
        value={`${this.LunarEmpsOver}`}
        label="Overcapped Lunar Emp"
        tooltip="Lunar Empowerment overcapping should never occur when it\'s possible to cast a Lunar Strike without overcapping Astral Power."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default LEmpowerment;
