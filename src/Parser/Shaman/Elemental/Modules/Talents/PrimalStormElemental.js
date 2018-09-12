import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

const damagingCasts = [SPELLS.EYE_OF_THE_STORM.id, SPELLS.WIND_GUST.id, SPELLS.CALL_LIGHTNING.id];
const CALL_LIGHTNING_BUFF_DURATION = 15000;

class PrimalStormElemental extends Analyzer {
  eotsCasts = 0;
  pseCasts = 0;
  lastCLCastTimestamp = 0;

  usedCasts = {
    eye_of_the_storm: false,
    wind_gust: false,
    call_lightning: false,
  };

  damageGained = 0;
  maelstromGained = 0;
  badCasts=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRIMAL_ELEMENTALIST_TALENT.id)
      && this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.STORM_ELEMENTAL_TALENT.id){
      return;
    }
    this.pseCasts+=1;
  }

  on_cast(event) {
    if(!damagingCasts.includes(event.ability.guid)){
      return;
    }

    if(event.ability.guid===SPELLS.EYE_OF_THE_STORM.id){
      this.usedCasts.eye_of_the_storm=true;
      return;
    }
    if(event.ability.guid===SPELLS.WIND_GUST.id){
      this.usedCasts.wind_gust=true;
      return;
    }
    if(event.ability.guid===SPELLS.CALL_LIGHTNING.id){
      this.usedCasts.call_lightning=true;
      this.lastCLCastTimestamp=event.timestamp;
    }
  }

  on_damage(event) {
    if (!damagingCasts.includes(event.ability.guid)) {
      return;
    }
    this.damageGained+=event.amount;

    if(event.ability.guid !== SPELLS.CALL_LIGHTNING.id) {
      if(event.timestamp>this.lastCLCastTimestamp+CALL_LIGHTNING_BUFF_DURATION){
        this.badCasts+=1;
      }
    }
  }


  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  suggestions(when) {
    const unusedSpellsCount = Object.values(this.usedCasts).filter(x=>!x).length;
    when(unusedSpellsCount).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your Storm Elemental is not using all of it's spells. Check if Wind Gust and Eye Of The Storm are set to autocast and you are using Call Lightning.</span>)
          .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
          .actual(`${formatNumber(unusedSpellsCount)} spells not used by your Storm Elemental`)
          .recommended(`You should be using all spells of your Storm Elemental.`)
          .regular(recommended+1).major(recommended+2);
      });

    when(this.badCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are not using <SpellLink id={SPELLS.CALL_LIGHTNING.id} /> on cooldown.</span>)
          .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
          .actual(`${formatNumber(this.badCasts)}`)
          .recommended(`0 is recommended`)
          .regular(recommended+5).major(recommended+10);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STORM_ELEMENTAL_TALENT.id} />}
        value={`~ ${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Buffed casts contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default PrimalStormElemental;
