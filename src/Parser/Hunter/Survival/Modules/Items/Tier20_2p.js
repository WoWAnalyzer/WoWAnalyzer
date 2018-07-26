import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

const T20_2P_DMG_BONUS = 0.15;

/**
 * Lacerate Deals 15% additional damage and lasts 6.0 sec longer.
 */
class Tier20_2p extends Analyzer {
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.HUNTER_SV_T20_2P_BONUS.id);
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LACERATE.id) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, T20_2P_DMG_BONUS);
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_SV_T20_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_SV_T20_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_SV_T20_2P_BONUS.id} icon={false} />,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default Tier20_2p;
