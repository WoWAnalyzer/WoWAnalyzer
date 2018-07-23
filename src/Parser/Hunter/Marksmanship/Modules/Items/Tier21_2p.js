import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import SCHOOLS from 'common/MAGIC_SCHOOLS';

const T21_2P_DMG_BONUS = 0.05;

/**
 * increases all physical daamge done by 5%.
 */
class Tier21_2p extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.HUNTER_MM_T21_2P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.type !== SCHOOLS.ids.PHYSICAL) {
      return;
    }
    this.damage += getDamageBonus(event, T21_2P_DMG_BONUS);
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T21_2P_BONUS.id} icon={false} />,
      result: (
        <dfn>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default Tier21_2p;
