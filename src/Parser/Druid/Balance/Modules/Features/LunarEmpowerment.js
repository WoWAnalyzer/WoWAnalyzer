import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';

class LunarEmpowerment extends Analyzer {
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
  LunarEmpsTotal = 0;

  CurrentAsP = 0;
  MaxAsP = 0;

  LSAsPGen = 150;

  on_byPlayer_cast(event) {

    if (!this.isLunarStrike(event) && !this.isStarsurge(event)) return;

    if (this.isLunarStrike(event) && this.LunarEmpsActive > 0){
        this.LunarEmpsActive--;
        this.LunarEmpsTotal++;
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
      if (event.classResources[i].type === RESOURCE_TYPES.ASTRAL_POWER.id) {
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

  get wastedPercentage() {
    return this.LunarEmpsOver / this.LunarEmpsTotal;
  }

  get wasted() {
    return this.LunarEmpsOver;
  }

  get generated() {
    return this.LunarEmpsTotal;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercentage,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }
  
  suggestions(when) {
    when(this.wastedPercentage).isGreaterThan(0.02)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You overcapped {this.LunarEmpsOver} Lunar Empowerments when you could have avoided it without overcapping Astral Power. Try to prioritize casting Lunar Strike over Starsurge when not near max AsP and having Lunar Empowerment stacks up.</Wrapper>)
            .icon('ability_druid_eclipse')
            .actual(`${formatPercentage(this.wastedPercentage)}% overcapped Lunar Empowerments`)
            .recommended('0 is recommended.')
            .regular(0.05).major(0.1);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_druid_eclipse" />}
        value={`${this.LunarEmpsOver}`}
        label="Overcapped Lunar Emp"
        tooltip={`${this.wasted} out of ${this.generated} (${formatPercentage(this.wastedPercentage)}%) Lunar Empowerments wasted. Lunar Empowerment overcapping should never occur when it is possible to cast a Lunar Strike without overcapping Astral Power.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default LunarEmpowerment;
