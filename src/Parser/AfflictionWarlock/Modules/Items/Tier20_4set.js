import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const T20_4SET_HASTE_BONUS = 0.15;

class Tier20_4set extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.WARLOCK_AFFLI_T20_4P_BUFF.id)) {
      this.bonusDmg += getDamageBonus(event, T20_4SET_HASTE_BONUS);
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id} />,
      result: (
        <dfn data-tip={'This result may be inaccurate as effect of haste buffs is difficult to calculate. This result is based on the premise that 15% haste allows you to do <code>(baseHaste * (100% + 15%) + 15%) - baseHaste</code> more things in the same amount of time, therefore the set bonus is estimated to be technically 15% damage increase for 8 seconds.'}>
          {`${formatNumber(this.bonusDmg)} damage - ${this.owner.formatItemDamageDone(this.bonusDmg)}`}
        </dfn>
      ),
    };
  }
}

export default Tier20_4set;
