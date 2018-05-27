import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DarkArbiter extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  darkArbiterActive = 0;
  totalDarkArbiterCasts = 0;
  totalRpSpent = 0;
  castTimestamp = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DARK_ARBITER_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const timestamp = event.timestamp;

    if(spellId === SPELLS.DARK_ARBITER_TALENT.id){
      this.castTimestamp = timestamp;
      this.darkArbiterActive = 1;
      this.totalDarkArbiterCasts++;
    }

    else if(this.darkArbiterActive && (this.castTimestamp + 22000) < timestamp) {
      this.darkArbiterActive = 0;
    }

    else if(this.darkArbiterActive) {
      if(spellId === SPELLS.DEATH_COIL.id || spellId === SPELLS.DEATH_STRIKE.id) {
        // both count the same towards the DA buff
        this.totalRpSpent += 45;
      }
    }

  }

  suggestions(when) {
    const avgRpPerCast = this.totalRpSpent / this.totalDarkArbiterCasts;
    when(avgRpPerCast).isLessThan(360)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your average <SpellLink id={SPELLS.DARK_ARBITER_TALENT.id} /> buff is low.  During Dark Arbiter casting <SpellLink id={SPELLS.DEATH_COIL.id} /> as soon as it is available is your top priority.</span>)
          .icon(SPELLS.DARK_ARBITER_TALENT.icon)
          .actual(`${avgRpPerCast}%`)
          .recommended(`>${recommended}% is recommended`)
          .regular(recommended - 60).major(recommended - 100);
      });
  }

  statistic() {
    const avgRpPerCast = this.totalRpSpent / this.totalDarkArbiterCasts;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DARK_ARBITER_TALENT.id} />}
        value={`${avgRpPerCast} %`}
        label="Average Dark Arbiter Buff"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default DarkArbiter;
