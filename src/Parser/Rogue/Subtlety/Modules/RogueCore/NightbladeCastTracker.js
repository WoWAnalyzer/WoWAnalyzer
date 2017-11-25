import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import FilteredCastTracker from './../CastTracker/FilteredCastTracker';

class NightbladeCastTracker extends FilteredCastTracker {
    
  on_initialized() {
    this.trackedCasts[SPELLS.NIGHTBLADE.id] = {};    
  }
    
  createAggregate() {
    return { casts: 0, symbolsCasts: 0 };
  }

  applyCastEvent(event, aggregate) {
    aggregate.casts += 1;
    if(this.combatants.selected.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id)) {
      aggregate.symbolsCasts += 1;
    }
  }

  suggestions(when) { 
    const aggregate = this.getAggregate(SPELLS.NIGHTBLADE.id);
    if(!aggregate) return;

    const badRefreshShare = aggregate.symbolsCasts  / aggregate.casts;
    when(badRefreshShare).isGreaterThan(0)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Do not refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> during <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} /> - cast <SpellLink id={SPELLS.EVISCERATE.id} /> instead. You can refresh <SpellLink id={SPELLS.NIGHTBLADE.id} /> early to make sure that its up for the full duration of <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />. </Wrapper>)
        .icon(SPELLS.NIGHTBLADE.icon)
        .actual(`You refreshed Nightblade ${aggregate.symbolsCasts} times during Symbols of Death.`)
        .recommended(`0 is recommend.`)
        .regular(0.1).major(0.2);
    });
  }

  
  statistic() {
    const nightbladeUptime = this.combatants.selected.getBuffUptime(SPELLS.NIGHTBLADE.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SYMBOLS_OF_DEATH.id} />}
        value={`${formatPercentage(nightbladeUptime)} %`}
        label="Nightblade uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default NightbladeCastTracker;