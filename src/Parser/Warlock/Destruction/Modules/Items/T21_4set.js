import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

// Chaos Bolt will deal an additional 12% of its direct damage caused to the target over 4 sec.
class T21_4set extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.WARLOCK_DESTRO_T21_4P_BONUS.id);
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
      title: <SpellLink id={SPELLS.WARLOCK_DESTRO_T21_4P_BONUS.id} icon={false} />,
      result: (
        <React.Fragment>
          <dfn data-tip={`Total bonus damage - ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
          </dfn>
        </React.Fragment>
      ),
    };
  }
}

export default T21_4set;
