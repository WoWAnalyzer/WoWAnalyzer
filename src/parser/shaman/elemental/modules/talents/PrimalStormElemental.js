import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const damagingCasts = [SPELLS.EYE_OF_THE_STORM.id, SPELLS.WIND_GUST.id, SPELLS.CALL_LIGHTNING.id];
const CALL_LIGHTNING_BUFF_DURATION = 15000;

class PrimalStormElemental extends Analyzer {
  eotsCasts = 0;
  pseCasts = 0;
  lastCLCastTimestamp = 0;

  usedCasts = {
    'Eye of the Storm': false,
    'Wind Gust': false,
    'Call Lightning': false,
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
    switch(event.ability.guid) {
      case SPELLS.EYE_OF_THE_STORM.id:
        this.usedCasts['Eye of the Storm']=true;
        break;
      case SPELLS.WIND_GUST.id:
        this.usedCasts['Wind Gust']=true;
        break;
      case SPELLS.CALL_LIGHTNING.id:
        this.usedCasts['Call Lightning']=true;
        this.lastCLCastTimestamp=event.timestamp;
        break;
      default:
        break;
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
    const unusedSpells = Object.keys(this.usedCasts).filter(key => !this.usedCasts[key]);
    const unusedSpellsString = unusedSpells.join(', ');
    const unusedSpellsCount = unusedSpells.length;
    when(unusedSpellsCount).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your Storm Elemental is not using all of it's spells. Check if Wind Gust and Eye Of The Storm are set to autocast and you are using Call Lightning.</span>)
          .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
          .actual(`${formatNumber(unusedSpellsCount)} spells not used by your Storm Elemental(${unusedSpellsString})`)
          .recommended(`You should be using all spells of your Storm Elemental.`)
          .major(recommended+1);
      });

    when(this.badCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are not using <SpellLink id={SPELLS.CALL_LIGHTNING.id} /> on cooldown.</span>)
          .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
          .actual(`${formatNumber(this.badCasts)} casts done by your Storm Elemental without the "Call Lightning"-Buff.}`)
          .recommended(`You should be recasting "Call Lightning" before the buff drops off.`)
          .major(recommended+5);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STORM_ELEMENTAL_TALENT.id} />}
        position={STATISTIC_ORDER.OPTIONAL()}
        value={`~ ${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Buffed casts contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
}

export default PrimalStormElemental;
