import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';
import ItemDamageDone from 'Main/ItemDamageDone';

// Chaos Bolt will deal an additional 12% of its direct damage caused to the target over 4 sec.
class T21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DESTRO_T21_4P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.WARLOCK_DESTRO_T21_4P_DEBUFF.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      id: `spell-${SPELLS.WARLOCK_DESTRO_T21_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_DESTRO_T21_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_DESTRO_T21_4P_BONUS.id} />,
      result:
        (<Wrapper>
          <dfn data-tip={`Total bonus damage - ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
          </dfn>
        </Wrapper>),
    };
  }
}

export default T21_4set;
