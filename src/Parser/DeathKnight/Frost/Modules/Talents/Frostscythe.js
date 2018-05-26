import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 *A sweeping attack that strikes all enemies in front of you for 135% Frost damage. This attack benefits from Killing Machine. Critical strikes with Frostscythe deal 4 times normal damage.
 */


class Frostscythe extends Analyzer{
  static dependencies = {
    combatants: Combatants,
  }

  casts = 0;
  hits = -1; // need to initialize negative to make sure first cast isn't counted as bad
  goodCasts = 0;
  hitThreshold = 0;

  on_initialized(){
    this.active = this.combatants.selected.hasTalent(SPELLS.FROSTSCYTHE_TALENT.id);
  }

  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FROSTSCYTHE_TALENT.id) {
      return;
    }
    if(this.hits >= this.hitThreshold){
      this.goodCasts += 1;
    }
    this.casts += 1;
    this.hitThreshold = this.combatants.selected.hasBuff(SPELLS.KILLING_MACHINE.id, event.timestamp) ? 1 : 3;
    this.hits = 0;
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FROSTSCYTHE_TALENT.id) {
      return;
    }
    this.hits += 1;
  }

  on_finished(){ // check if the last cast of Fsc was good
    if(this.hits >= this.hitThreshold){
      this.goodCasts += 1;
    }
  }
  
  get efficiency() {
    return this.goodCasts / this.casts;
  }

  get efficencyThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: .75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.efficencyThresholds).addSuggestion((suggest, actual, recommended) => {
          return suggest(
            <React.Fragment>
            Your <SpellLink id={SPELLS.FROSTSCYTHE_TALENT.id}/> efficiency can be improved.  Only cast Frostscythe if you have a <SpellLink id={SPELLS.KILLING_MACHINE.id} icon/> proc or you can hit 3+ targets.
            </React.Fragment>)
            .icon(SPELLS.FROSTSCYTHE_TALENT.icon)
            .actual(`${formatPercentage(actual)}% Frostscythe efficiency`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic(){
    return <StatisticBox
      icon={<SpellIcon id={SPELLS.FROSTSCYTHE_TALENT.id} />}
      value={`${formatPercentage(this.efficiency)}%`}
      label={'Frostscythe efficiency'}
      tooltip={`A good cast is one where you either hit 1+ targets with a Killing Machine buff or you hit 3+ targets.  You had ${this.goodCasts} / ${this.casts} good casts`}
    />;
  }  
  statisticOrder = STATISTIC_ORDER.CORE(60);
}

export default Frostscythe;
