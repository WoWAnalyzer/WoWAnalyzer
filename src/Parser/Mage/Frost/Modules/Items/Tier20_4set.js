import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const FROZEN_ORB_CDR_MS = 4000;

/**
 * Frost Mage Tier20 4set
 * The cooldown of Frozen Orb is reduced by 4.0 sec whenever you gain Brain Freeze.
 */
class Tier20_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  totalCdr = 0;
  casts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FROZEN_ORB.id) {
      this.casts += 1;
    }
  }

  on_toPlayer_refreshbuff(event) {
    this._handleBuff(event);
  }

  on_toPlayer_applybuff(event) {
    this._handleBuff(event);
  }

  _handleBuff(event) {
    if (event.ability.guid !== SPELLS.BRAIN_FREEZE.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.FROZEN_ORB.id)) {
      this.totalCdr += this.spellUsable.reduceCooldown(SPELLS.FROZEN_ORB.id, FROZEN_ORB_CDR_MS);
    }
  }

  item() {
    const avgCdr = (this.totalCdr / this.casts) || 0;
    return {
      id: SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id} />,
      result: `Reduced ${(avgCdr / 1000).toFixed(1)}s per cast / ${(this.totalCdr / 1000).toFixed(1)}s total`,
    };
  }
}

export default Tier20_4set;
