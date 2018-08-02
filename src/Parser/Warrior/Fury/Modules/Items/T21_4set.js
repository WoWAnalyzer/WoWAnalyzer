import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

class T21_4set extends Analyzer {
  // Rampage is in fact 5 separate spells cast in this sequence
  rampage = [SPELLS.RAMPAGE_1.id, SPELLS.RAMPAGE_2.id, SPELLS.RAMPAGE_3.id, SPELLS.RAMPAGE_4.id];
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.WARRIOR_FURY_T21_4P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if (!this.rampage.includes(event.ability.guid)) {
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id, event.timestamp)) {
      return;
    }

    this.damage += event.amount * 0.2;
  }

  item() {
    return {
      id: `spell-${SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id} icon={false} />,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default T21_4set;
