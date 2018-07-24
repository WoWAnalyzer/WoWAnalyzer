import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import getDamageBonus from 'Parser/Core/calculateEffectiveDamage';

/**
 * Increases damage dealt by Aimed Shot by 12%
 */

const DAMAGE_MODIFIER = 0.12;

class Tier21_4p extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.HUNTER_MM_T21_4P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    this.damage += getDamageBonus(event, DAMAGE_MODIFIER);
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T21_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T21_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T21_4P_BONUS.id} icon={false} />,
      result: (
        <dfn>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default Tier21_4p;
