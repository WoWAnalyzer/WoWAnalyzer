import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import Haste from 'Parser/Core/Modules/Haste';

// TODO: figure out a good solution for isAvailable parameters
const GCD_SPELLS = {
  // Rotational spells
  [SPELLS.MANGLE_BEAR.id]: {
    isFiller: false,
    baseCD: 6,
    hastedCD: true,
    isAvailable: (isOffCooldown, combatant, target, timestamp) => {
      const hasGoreProc = combatant.hasBuff(SPELLS.GORE_BEAR.id, timestamp);
      return hasGoreProc || isOffCooldown;
    },
  },
  [SPELLS.THRASH_BEAR.id]: {
    isFiller: false,
    baseCD: 6,
    hastedCD: true,
    isAvailable: (isOffCooldown, combatant, target, timestamp) => {
      const isIncarnation = combatant.hasBuff(SPELLS.INCARNATION_OF_URSOC.id, timestamp);
      return isIncarnation || isOffCooldown;
    },
  },
  [SPELLS.PULVERIZE_TALENT.id]: {
    isFiller: false,
    baseCD: null,
    isAvailable: (isOffCooldown, combatant, target) => {
      // TODO: make this stacks deficit
      const targetHasThrash = target.getBuff(SPELLS.THRASH_BEAR_DOT.id).stacks >= 2;
      return targetHasThrash;
    },
  },
  [SPELLS.MAUL.id]: {
    isFiller: false,
    baseCD: null,
    isAvailable: (isOffCooldown, combatant, target) => {
      // TODO:generalize this to be available for all resource types
      const rageAvailable = resources >= 45;
      return rageAvailable;
    },
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
    enemies: Enemies,
    haste: Haste,
  };

  _hasteLog = [];
  abilityLastCasts = {};

  on_initialized() {
    const baseHaste = this.combatants.selected.hastePercentage;
    this.recordHasteChange(baseHaste, this.owner.fight.start_time);
  }

  on_changehaste(event) {
    this.recordHasteChange(event.newHaste, this.owner.currentTimestamp);
  }

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (!GCD_SPELLS[spellID]) {
      const timestamp = event.timestamp;
      const lastCast = this.abilityLastCasts[spellID] || -Infinity;
      const target = this.enemies.enemies[event.targetID];
      const combatant = this.combatants.selected;

      this.abilityLastCasts[spellID] = timestamp;
    }
  }

  on_finished() {
    console.log('[haste log]', this._hasteLog);
  }

  isAbilityOffCooldown

  recordHasteChange(newHaste, timestamp) {
    if (this._hasteLog.length === 0) {
      this._hasteLog.push({ timestamp, haste: newHaste });
    }

    const lastHasteIndex = this._hasteLog.length - 1;
    const lastHaste = this._hasteLog[lastHasteIndex];

    if (lastHaste.timestamp === timestamp) {
      // If the haste change occured simultaneously with another haste change,
      // treat it as a single change
      this._hasteLog[lastHasteIndex].haste = newHaste;
    }

    if (lastHaste.haste !== newHaste) {
      // Conversely, only record a haste change if there was actually a change
      this._hasteLog.push({ timestamp, haste: newHaste });
    }
  }
}

export default AntiFillerSpam;
