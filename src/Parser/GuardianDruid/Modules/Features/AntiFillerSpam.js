import React from 'react';

import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const MANGLE_BASE_CD = 6;
const THRASH_BASE_CD = 6;

const GCD_SPELLS = {
  // Rotational spells
  [SPELLS.MANGLE_BEAR.id]: {
    isFiller: false,
    isAvailable: (timestamp, lastCast, combatant, haste) => {
      const hasGoreProc = combatant.hasBuff(SPELLS.GORE_BEAR.id, timestamp);
      const cooldown = MANGLE_BASE_CD / (1 + haste);
      const isNotOnCD = lastCast + (cooldown * 1000) < timestamp;

      return (hasGoreProc || isNotOnCD);
    },
  },
  [SPELLS.THRASH_BEAR.id]: {
    isFiller: false,
    isAvailable: (timestamp, lastCast, target, combatant, haste) => {
      const isIncarnation = combatant.hasBuff(SPELLS.INCARNATION_OF_URSOC.id, timestamp);
      const cooldown = THRASH_BASE_CD / (1 + haste);
      const isNotOnCD = lastCast + (cooldown * 1000) < timestamp;

      return (isIncarnation || isNotOnCD);
    },
  },
  [SPELLS.MAUL.id]: {
    isFiller: false,
    isAvailable: (timestamp, lastCast, target, combatant, haste, rage) => {
      const rageAvailable = rage >= 45;
      return rageAvailable;
    },
  },
  [SPELLS.PULVERIZE_TALENT.id]: {
    isFiller: false,
    isAvailable: (timestamp, lastCast, target) => {
      // TODO: make this stacks deficit
      const targetHasThrash = target.getBuff(SPELLS.THRASH_BEAR_DOT.id).stacks >= 2;
      return targetHasThrash;
    }
  },

  // "Filler" spells
  [SPELLS.MOONFIRE.id]: {
    isFiller: (combatant, timestamp) => combatant.hasBuff(SPELLS.GALACTIC_GUARDIAN.id, timestamp),
  },
  [SPELLS.BEAR_SWIPE.id]: {
    isFiller: true,
  },

  // Utility/other spells
  [SPELLS.STAMPEDING_ROAR_BEAR.id]: { isFiller: false },
  [SPELLS.BEAR_FORM.id]: { isFiller: false },
  [SPELLS.CAT_FORM.id]: { isFiller: false },
  [SPELLS.TRAVEL_FORM.id]: { isFiller: false },
  [SPELLS.MOONKIN_FORM.id]: { isFiller: false },
  [SPELLS.REBIRTH.id]: { isFiller: false },
};

class AntiFillerSpam extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  seen = {};

  on_byPlayer_cast(event) {
    if (!GCD_SPELLS[event.ability.guid] && !this.seen[event.ability.guid]) {
      console.log('[non-gcd spell]:', SPELLS[event.ability.guid].name, event.ability.guid);
      this.seen[event.ability.guid] = true;
    }
  }
}

export default AntiFillerSpam;
