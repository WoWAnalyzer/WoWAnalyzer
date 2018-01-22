import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const T20_2P_DMG_BONUS = 0.15;

/**
 * Lacerate Deals 15% additional damage and lasts 6.0 sec longer.
 */
class Tier20_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T20_2P_BONUS.id);
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, T20_2P_DMG_BONUS);
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_SV_T20_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_SV_T20_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_SV_T20_2P_BONUS.id} />,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default Tier20_2p;
