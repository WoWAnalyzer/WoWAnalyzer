import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const damagingCasts = [SPELLS.METEOR.id, SPELLS.IMMOLATE.id, SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id];

class PrimalFireElemental extends Analyzer {
  meteorCasts = 0;
  PFEcasts = 0;

  usedCasts = {
    meteor: false,
    immolate: false,
    fire_blast: false,
  };

  damageGained = 0;
  maelstromGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PRIMAL_ELEMENTALIST_TALENT.id)
      && (!this.selectedCombatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id));
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.FIRE_ELEMENTAL.id){
      return;
    }

    this.PFEcasts+=1;
  }

  on_damage(event) {
    if (!damagingCasts.includes(event.ability.guid)) {
      return;
    }
    this.damageGained+=event.amount;

    if(event.ability.guid !== SPELLS.METEOR.id) {
      return;
    }
    this.meteorCasts+=1;
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid !== SPELLS.FIRE_ELEMENTAL.id){
      return;
    }

    this.maelstromGained+=event.amount;
  }

  on_cast(event) {
    if(!damagingCasts.includes(event.ability.guid)){
      return;
    }

    if(event.ability.guid===SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id){
      this.usedCasts.fire_blast=true;
      return;
    }
    if(event.ability.guid===SPELLS.IMMOLATE.id){
      this.usedCasts.immolate=true;
      return;
    }
    if(event.ability.guid===SPELLS.METEOR.id){
      this.usedCasts.meteor=true;
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  get missedMeteorCasts() {
    return this.PFEcasts-this.meteorCasts;
  }

  suggestions(when) {
    const unusedSpellsCount = Object.values(this.usedCasts).filter(x=>!x).length;
    when(unusedSpellsCount).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your Fire Elemental is not using all of it's spells. Check if immolate and Fire Blast are set to autocast and you are using Meteor.</span>)
          .icon(SPELLS.FIRE_ELEMENTAL.icon)
          .actual(`${formatNumber(unusedSpellsCount)} spells not used by your Fire Elemental`)
          .recommended(`You should be using all spells of your Fire Elemental.`)
          .regular(recommended+1).major(recommended+2);
      });
    when(this.missedMeteorCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are not using <SpellLink id={SPELLS.METEOR.id} /> every time you cast <SpellLink id={SPELLS.FIRE_ELEMENTAL.id} />. Only wait with casting meteor if you wait for adds to spawn.</span>)
          .icon(SPELLS.FIRE_ELEMENTAL.icon)
          .actual(`${formatNumber(this.missedMeteorCasts)}`)
          .recommended(`0 is recommended`)
          .regular(recommended+1).major(recommended+2);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FIRE_ELEMENTAL.id} />}
        value={`~ ${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`PFE contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default PrimalFireElemental;
