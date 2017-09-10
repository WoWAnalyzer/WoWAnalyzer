import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class ChiBurst extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  castChiBurst = 0;
  healing = 0;
  targetsChiBurst = 0;
  avgChiBurstTargets = 0;
  raidSize = 0;


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CHI_BURST_TALENT.id);
    this.raidSize = Object.entries(this.combatants.players).length;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CHI_BURST_TALENT.id) {
      this.castChiBurst += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (!this.combatants.players[targetId]) {
      return;
    }

    if (spellId === SPELLS.CHI_BURST_HEAL.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.targetsChiBurst += 1;
    }
  }

  suggestions(when) {
    when(this.avgChiBurstTargets).isLessThan(this.raidSize * .3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are not utilizing your <SpellLink id={SPELLS.CHI_BURST_TALENT.id} /> talent as effectively as you should. You should work on both your positioning and aiming of the spell. Always aim for the highest concentration of players, which is normally melee.</span>)
          .icon(SPELLS.CHI_BURST_TALENT.icon)
          .actual(`${this.avgChiBurstTargets.toFixed(2)} targets hit per Chi Burst cast - ${formatPercentage(this.avgChiBurstTargets / this.raidSize)}% of raid hit`)
          .recommended(`30% of the raid hit is recommended`)
          .regular(recommended - .05).major(recommended - .1);
      });
  }

  on_finished() {
    this.avgChiBurstTargets = this.targetsChiBurst / this.castChiBurst || 0;
    if (debug) {
      console.log('ChiBurst Casts: ' + this.castChiBurst);
      console.log('Total Chi Burst Healing: ' + this.healing);
      console.log('Chi Burst Targets Hit: ' + this.targetsChiBurst);
    }
  }
}

export default ChiBurst;
