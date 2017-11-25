import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import FilteredCastTracker from './../CastTracker/FilteredCastTracker';

class ShadowDanceCastTracker extends FilteredCastTracker {

  danceCount = 0;
  castsInDance = 0;

  on_initialized() {
    this.trackedCasts[SPELLS.BACKSTAB.id] = {};    
    this.trackedCasts[SPELLS.GLOOMBLADE_TALENT.id] = {};   
    this.trackedCasts[SPELLS.SHURIKEN_STORM.id] = {};   
    this.trackedCasts[SPELLS.SHADOWSTRIKE.id] = {};   
    this.trackedCasts[SPELLS.NIGHTBLADE.id] = {};   
    this.trackedCasts[SPELLS.EVISCERATE.id] = {};
  }
  
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_DANCE.id) {
      this.danceCount++;
    }
    super.on_byPlayer_cast(event);
  }
    
  applyCastEvent(event, aggregate) {
    super.applyCastEvent(event, aggregate);
    if(this.combatants.selected.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id)) {
      aggregate.danceCasts += 1;
      this.castsInDance += 1;
    }
  }

  suggestions(when) { 
    let aggregate = this.getAggregate(SPELLS.BACKSTAB.id);
    if(aggregate){
        const backstab = aggregate.danceCasts;
        when(backstab).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={SPELLS.BACKSTAB.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </Wrapper>)
            .icon(SPELLS.BACKSTAB.icon)
            .actual(`You cast Backstab ${backstab} times during Shadow Dance.`)
            .recommended(`0 is recommend.`)
            .regular(0).major(1);
        });
    }

    aggregate = this.getAggregate(SPELLS.GLOOMBLADE_TALENT.id);
    if(aggregate){
        const gloomblade = aggregate.danceCasts;
        when(gloomblade).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Use <SpellLink id={SPELLS.SHADOWSTRIKE.id} /> instead of <SpellLink id={SPELLS.GLOOMBLADE_TALENT.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} />. </Wrapper>)
            .icon(SPELLS.GLOOMBLADE_TALENT.icon)
            .actual(`You cast Gloomblade ${gloomblade} times during Shadow Dance.`)
            .recommended(`0 is recommend.`)
            .regular(0).major(1);
        });
    }  
    const missedCastsInDanceShare = this.castsInDance/(this.danceCount * 4);
    when(missedCastsInDanceShare).isLessThan(1)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Try to always cast 4 spells during <SpellLink id={SPELLS.SHADOW_DANCE_BUFF.id} /> </Wrapper>)
        .icon(SPELLS.SHADOW_DANCE_BUFF.icon)
        .actual(`You cast less ${this.castsInDance} spells during Shadow Dance out of ${this.danceCount * 4} possible.`)
        .recommended(`${this.danceCount * 4} recommended`)
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

export default ShadowDanceCastTracker;