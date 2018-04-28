import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class SoothingMist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  soomTicks = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SOOTHING_MIST.id) {
      this.soomTicks += 1;
    }
  }

  on_finished() {
    if (debug) {
      console.log(`SooM Ticks: ${this.soomTicks}`);
      console.log('SooM Perc Uptime: ', (this.soomTicks * 2 / this.owner.fightDuration * 1000));
      console.log('SooM Buff Update: ', this.combatants.selected.getBuffUptime(SPELLS.SOOTHING_MIST.id), ' Percent: ', this.combatants.selected.getBuffUptime(SPELLS.SOOTHING_MIST.id) / this.owner.fightDuration);
    }
  }

  get soomTicksPerDuration() {
    const soomTicks = (this.soomTicks * 2 / this.owner.fightDuration * 1000) || 0;
    return soomTicks >= 1.5;
  }

  get suggestionThresholds() {
    return {
      actual: this.soomTicksPerDuration,
      isEqual: true,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest) => {
        return suggest(
          <React.Fragment>
            You are allowing <SpellLink id={SPELLS.SOOTHING_MIST.id} /> to channel for an extended period of time. <SpellLink id={SPELLS.SOOTHING_MIST.id} /> does little healing, so your time is better spent DPS'ing throug the use of <SpellLink id={SPELLS.TIGER_PALM.id} /> and <SpellLink id={SPELLS.BLACKOUT_KICK.id} />.
          </React.Fragment>
        )
          .icon(SPELLS.SOOTHING_MIST.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}

export default SoothingMist;
