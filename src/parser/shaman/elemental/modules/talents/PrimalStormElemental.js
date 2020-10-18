import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_ELEMENTAL_TALENT), this.onStormEleCast);
      this.addEventListener(Events.cast, this.onCast);
      this.addEventListener(Events.damage, this.onDamage);
  }

  onStormEleCast(event) {
    this.pseCasts+=1;
  }

  onCast(event) {
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

  onDamage(event) {
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
      .addSuggestion((suggest, actual, recommended) => suggest(<span> Your Storm Elemental is not using all of it's spells. Check if Wind Gust and Call Lightning are set to autocast and you are using Eye Of The Storm.</span>)
          .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
          .actual(i18n._(t('shaman.elemental.suggestions.primalStormElemental.spellsNotUsed')`${formatNumber(unusedSpellsCount)} spells not used by your Storm Elemental (${unusedSpellsString})`))
          .recommended(`You should be using all spells of your Storm Elemental.`)
          .major(recommended+1));

    when(this.badCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You are not using <SpellLink id={SPELLS.CALL_LIGHTNING.id} /> on cooldown.</span>)
          .icon(SPELLS.STORM_ELEMENTAL_TALENT.icon)
          .actual(i18n._(t('shaman.elemental.suggestions.primalStormElemental.badCasts')`${formatNumber(this.badCasts)} casts done by your Storm Elemental without the "Call Lightning"-Buff.`))
          .recommended(`You should be recasting "Call Lightning" before the buff drops off.`)
          .major(recommended+5));
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
