import React from 'react';
import CoreChanneling from 'parser/shared/modules/Channeling';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

import Analyzer from 'parser/core/Analyzer';

const debug = false;

class SoothingMist extends Analyzer {
  static dependencies = {
    channeling: CoreChanneling,
  };

  soomTicks = 0;
  gustProc = 0;
  lastSoomTickTimestamp = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SOOTHING_MIST.id) {
      this.soomTicks += 1;
      this.lastSoomTickTimestamp = event.timestamp;
    }
    
    if (spellId === SPELLS.GUSTS_OF_MISTS.id && this.lastSoomTickTimestamp === event.timestamp) {
      this.gustProc += 1;
    }
  }

  on_finished() {
    if (debug) {
      console.log(`SooM Ticks: ${this.soomTicks}`);
      console.log('SooM Perc Uptime: ', (this.soomTicks * 2 / this.owner.fightDuration * 1000));
      console.log('SooM Buff Update: ', this.selectedCombatant.getBuffUptime(SPELLS.SOOTHING_MIST.id), ' Percent: ', this.selectedCombatant.getBuffUptime(SPELLS.SOOTHING_MIST.id) / this.owner.fightDuration);
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
          <>
            You are allowing <SpellLink id={SPELLS.SOOTHING_MIST.id} /> to channel for an extended period of time. <SpellLink id={SPELLS.SOOTHING_MIST.id} /> does little healing, so your time is better spent DPS'ing throug the use of <SpellLink id={SPELLS.TIGER_PALM.id} /> and <SpellLink id={SPELLS.BLACKOUT_KICK.id} />.
          </>
        )
          .icon(SPELLS.SOOTHING_MIST.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}

export default SoothingMist;
