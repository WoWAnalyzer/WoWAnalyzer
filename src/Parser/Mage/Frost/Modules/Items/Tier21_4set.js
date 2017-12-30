import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const DAMAGE_BONUS = 0.20;

/**
 * Frost Mage Tier21 4set
 * When you consume Brain Freeze, the damage of your next Ice Lance is increased by 20%.
 */
class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  damage = 0;

  on_initialized() {
	   this.active = this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T21_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.ICE_LANCE_DAMAGE.id) {
      return;
    }

    // the buff indicating damage boosted ice lance appears to take its time disappating,
    // allowing us to check the buff on damage rather than tracking which cast has/hasn't got it
    if (this.combatants.selected.hasBuff(SPELLS.ARCTIC_BLAST.id)) {
      this.damage += getDamageBonus(event, DAMAGE_BONUS);
    }
  }


  item() {
    return {
      id: SPELLS.FROST_MAGE_T21_4SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.FROST_MAGE_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FROST_MAGE_T21_4SET_BONUS_BUFF.id} />,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default Tier21_4set;
