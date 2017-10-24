import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

import SheilunsGift from '../../Modules/Spells/SheilunsGift';

const debug = false;

class WhispersOfShaohao extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    sheilunsGift: SheilunsGift,
  };

  whispersHeal = 0;
  whispersOverHeal = 0;
  countWhispersHeal = 0;

  on_initialize() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.id] === 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.WHISPERS_OF_SHAOHAO.id) {
      this.whispersHeal += event.amount;
      if (event.overheal) {
        this.whispersOverHeal += event.overheal;
      }
      this.countWhispersHeal += 1;
      debug && console.log(`Whispers Heal: ${event.amount} / Whispers Overheal: ${event.overheal}`);
    }
  }

  suggestions(when) {
    const missedWhispersHeal = ((Math.floor(this.owner.fightDuration / 10000) + this.sheilunsGift.countEff) - this.countWhispersHeal) || 0;
    when(missedWhispersHeal).isGreaterThan(5)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You missed multiple <SpellLink id={SPELLS.WHISPERS_OF_SHAOHAO.id} /> healing procs. While you cannot actively place the clouds that spawn, work to position yourself near other members of the raid so that when the clouds are used, they heal someone. </span>)
          .icon(SPELLS.WHISPERS_OF_SHAOHAO_TRAIT.icon)
          .actual(`${missedWhispersHeal} missed heals`)
          .recommended(`<${recommended} missed is recommended`)
          .regular(recommended + 2).major(recommended + 5);
      });
  }

  on_finished() {
    if (debug) {
      console.log('Whispers Heals: ', this.whispersHeal);
    }
  }
}

export default WhispersOfShaohao;
