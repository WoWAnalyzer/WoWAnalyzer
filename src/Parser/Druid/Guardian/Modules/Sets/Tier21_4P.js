import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ItemHealingDone from 'Main/ItemHealingDone';
import SPELLS from 'common/SPELLS';

/**
 * T21 4p increases healing received after Barkskin fades by 10% for 20s.
 */
class Tier21_4P extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  HEAL_MODIFIER = 0.1;

  _healing = 0;
  get healing() {
    return this._healing;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.GUARDIAN_TIER_21_4P_SET_BONUS.id);
  }

  on_toPlayer_heal(event) {
    const buffPresent = this.combatants.selected.hasBuff(SPELLS.GUARDIAN_TIER_21_4P_SET_BONUS_BUFF.id);
    if (buffPresent) {
      this._healing += event.amount - (event.amount / (1 + this.HEAL_MODIFIER));
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.GUARDIAN_TIER_21_4P_SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.GUARDIAN_TIER_21_4P_SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.GUARDIAN_TIER_21_4P_SET_BONUS.id} />,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default Tier21_4P;
