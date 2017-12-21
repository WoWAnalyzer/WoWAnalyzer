import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ResourceTypes from 'common/RESOURCE_TYPES';

class SEmpowerment extends Analyzer {
  isSolarWrath(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.SOLAR_WRATH_MOONKIN.id;
  }
  isStarsurge(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.STARSURGE_MOONKIN.id;
  }  
  isCoolDown(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.CELESTIAL_ALIGNMENT.id || spellId === SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id;
  }

  SolarEmpsActive = 0;
  SolarEmpsOver = 0;

  CurrentAsP = 0;
  MaxAsP = 0;

  SWAsPGen = 100;

  on_byPlayer_cast(event) {

    if (!this.isSolarWrath(event) && !this.isStarsurge(event)) return;

    if (this.isSolarWrath(event) && this.SolarEmpsActive > 0){
        this.SolarEmpsActive--;
    }
    else if (this.isStarsurge(event)){
      if (this.SolarEmpsActive < 3)
        this.SolarEmpsActive++;
      else if (this.MaxAsP - this.CurrentAsP >= this.SWAsPGen)
        this.SolarEmpsOver++;
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
    if (this.isCoolDown) this.SWAsPGen = 150;
  }
  on_toPlayer_removebuff(event) {
    if (this.isCoolDown) this.SWAsPGen = 100;
  }
  
  suggestions(when) {
    const wastedPerMin = Math.round((((this.SolarEmpsOver) / (this.owner.fightDuration / 1000)) * 60)*10) / 10;
    when(wastedPerMin).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overcapped {this.SolarEmpsOver} Solar Empowerments when you could have avoided it without overcapping Astral Power. Try to prioritize casting Solar Wrath over Starsurge when not near max AsP and having Solar Empowerment stacks up.</span>)
            .icon('ability_druid_eclipseorange')
            .actual(`${actual} avoidable overcapped Solar Empowerments per minute`)
            .recommended('0 is recommended.')
            .regular(recommended + 1).major(recommended + 2);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_druid_eclipseorange" />}
        value={`${this.SolarEmpsOver}`}
        label="Overcapped Solar Emp"
        tooltip="Solar Empowerment overcapping should never occur when it\'s possible to cast a Solar Wrath without overcapping Astral Power."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default SEmpowerment;
