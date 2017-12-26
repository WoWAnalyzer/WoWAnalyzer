import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

class T21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // Rampage is in fact 5 separate spells cast in this sequence
  rampage = [SPELLS.RAMPAGE_1.id, SPELLS.RAMPAGE_2.id, SPELLS.RAMPAGE_3.id, SPELLS.RAMPAGE_4.id, SPELLS.RAMPAGE_5.id]
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARRIOR_FURY_T21_4P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if (!this.rampage.includes(event.ability.guid)) {
        return;
    }

    if (!this.combatants.selected.hasBuff(SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id, event.timestamp)) {
        return;
    }

    this.damage += event.amount * 0.2;
  }

  item() {
    return {
      id: `spell-${SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.WARRIOR_FURY_T21_4P_BONUS_BUFF.id} />,
      result: (
        <Wrapper>
          {this.owner.formatItemDamageDone(this.damage)}
        </Wrapper>
      ),
    };
  }
}

export default T21_4set;
