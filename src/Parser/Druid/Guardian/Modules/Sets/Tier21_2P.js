import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

// Formats a number to display in seconds with millisecond precision, but remove trailing zeros if applicable
function formatTimer(timeInMs) {
  return Number((timeInMs / 1000).toFixed(3));
}

class Tier21_2P extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  BARKSKIN_REDUCTION_MS = 1000;

  _totalReductionMs = 0;
  get totalReductionMs() {
    return this._totalReductionMs;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.GUARDIAN_TIER_21_2P_SET_BONUS.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MANGLE_BEAR.id) {
      const hasGoreBuff = this.combatants.selected.hasBuff(SPELLS.GORE_BEAR.id);
      const isOnCooldown = this.spellUsable.isOnCooldown(SPELLS.BARKSKIN.id);
      if (hasGoreBuff && isOnCooldown) {
        this._totalReductionMs += this.spellUsable.reduceCooldown(SPELLS.BARKSKIN.id, this.BARKSKIN_REDUCTION_MS);
      }
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.GUARDIAN_TIER_21_2P_SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.BARKSKIN.id} />,
      title: <SpellLink id={SPELLS.GUARDIAN_TIER_21_2P_SET_BONUS.id} />,
      result: `Total reduction: ${formatTimer(this.totalReductionMs)} seconds`,
    };
  }
}

export default Tier21_2P;
