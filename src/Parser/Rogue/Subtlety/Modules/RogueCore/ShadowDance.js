import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

class ShadowDance extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };
  
  totalShadowDanceCast = 0;
  totalDamageDoneInShadowDance = 0;
  totalEviscerateDamageInShadowDance = 0;
  inShadowDance = false;

  // TODO: Refactor this as a cast tracker, 
  // That is easy to setup for tracking a spells cast on certain conditions. 
  // And then easy to create suggestions.
  currentDance = {};
  danceCasts = [];
  totalCastsInDance = {
    backstab: 0,
    gloomblade: 0,
    storm: 0,
    nightblade: 0,
    evis: 0,
    shadowstrike: 0,
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE.id) {
      this.currentDance = {
        casts: 0,
      };
      this.danceCasts.push(this.currentDance);
      this.totalShadowDanceCast += 1;
    }
    if(this.inShadowDance) {
      if (spellId === SPELLS.BACKSTAB.id) {
        this.currentDance.casts += 1;
        this.totalCastsInDance.backstab += 1;
      }
      if (spellId === SPELLS.GLOOMBLADE_TALENT.id) {
        this.currentDance.casts += 1;
        this.totalCastsInDance.gloomblade += 1;
      }
      if (spellId === SPELLS.SHURIKEN_STORM.id) {
        this.currentDance.casts += 1;
        this.totalCastsInDance.storm += 1;
      }
      if (spellId === SPELLS.SHADOWSTRIKE.id) {
        this.currentDance.casts += 1;
        this.totalCastsInDance.shadowstrike += 1;
      }
      if (spellId === SPELLS.NIGHTBLADE.id) {
        this.currentDance.casts += 1;
        this.totalCastsInDance.nightblade += 1;
      }
      if (spellId === SPELLS.EVISCERATE.id) {
        this.currentDance.casts += 1;
        this.totalCastsInDance.evis += 1;
      }
    }
  }

  //Includes the DFA Eviscerate. 
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.inShadowDance) {
      this.totalDamageDoneInShadowDance += event.amount;
      if (spellId === SPELLS.EVISCERATE.id) {
        this.totalEviscerateDamageInShadowDance += 1;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE_BUFF.id) {
      this.inShadowDance = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE_BUFF.id) {
      this.inShadowDance = false;
    }
  }

  suggestions(when) { 
    const backstab = this.totalCastsInDance.backstab;
    when(backstab).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={SPELLS.BACKSTAB.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </Wrapper>)
        .icon(SPELLS.BACKSTAB.icon)
        .actual(`You cast Backstab ${backstab} times during Shadow Dance.`)
        .recommended(`0 is recommend.`)
        .regular(0).major(1);
    });
    
    const gloomblade = this.totalCastsInDance.gloomblade;
    when(gloomblade).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={SPELLS.GLOOMBLADE_TALENT.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </Wrapper>)
        .icon(SPELLS.GLOOMBLADE_TALENT.icon)
        .actual(`You cast Gloomblade ${gloomblade} times during Shadow Dance.`)
        .recommended(`0 is recommend.`)
        .regular(0).major(1);
    });

    const castsInDance = this.danceCasts.reduce((a,b)=>({casts: a.casts+b.casts}), {casts: 0}).casts;
    const danceWithLowCastsShare = castsInDance/(this.totalShadowDanceCast * 4);
    when(danceWithLowCastsShare).isLessThan(0.95)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Try to always cast 4 spells during <SpellLink id={SPELLS.SHADOW_DANCE_BUFF.id} /> </Wrapper>)
        .icon(SPELLS.SHADOW_DANCE_BUFF.icon)
        .actual(`You cast less ${castsInDance} spells during Shadow Dance out of ${this.totalShadowDanceCast * 4} possible.`)
        .recommended(`${this.totalShadowDanceCast * 4} recommended`)
        .regular(0.90).major(0.80);
    });
  }

  statistic() {
    const shadowDanceUptime = this.combatants.selected.getBuffUptime(SPELLS.SHADOW_DANCE_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_DANCE_BUFF.id} />}
        value={`${formatPercentage(shadowDanceUptime)} %`}
        label="Shadow Dance uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default ShadowDance;
