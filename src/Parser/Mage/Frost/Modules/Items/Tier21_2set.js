import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const DAMAGE_BONUS_PER_BOLT = 0.15;
const NEW_FLURRY_TIME_GAP_MS = 750;

/**
 * Frost Mage Tier21 2set
 * Each successive ice bolt of a cast of Flurry deals 15% more damage.
 */
class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  damage = 0;
  iceBolt = 0;
  lastHitTimestamp;

  on_initialized() {
	   this.active = this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T21_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.FLURRY_DAMAGE.id) {
      return;
    }

    if (!this.lastHitTimestamp || this.lastHitTimestamp + NEW_FLURRY_TIME_GAP_MS < event.timestamp) {
      this.iceBolt = 0;
    }
    this.lastHitTimestamp = event.timestamp;

    if(this.iceBolt >= 3) {
      console.warn("More than 3 Flurry bolts detected in quick succession... assuming 2 consecutive casts w/ high haste?");
      this.iceBolt = 0;
    }

    if(this.iceBolt) {
      this.damage += getDamageBonus(event, this.iceBolt * DAMAGE_BONUS_PER_BOLT);
    }
    this.iceBolt += 1;
  }

  item() {
    return {
      id: SPELLS.FROST_MAGE_T21_2SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.FROST_MAGE_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FROST_MAGE_T21_2SET_BONUS_BUFF.id} />,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default Tier21_2set;
