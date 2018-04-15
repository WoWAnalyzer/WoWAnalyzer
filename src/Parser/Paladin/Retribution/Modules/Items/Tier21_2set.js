import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import GetDamageBonus from 'Parser/Paladin/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const RET_PALADIN_T21_2SET_MODIFIER = 0.4;

class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damageDone = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T21_2SET_BONUS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.JUDGMENT_CAST.id) {
      return;
    }
    this.damageDone += GetDamageBonus(event, RET_PALADIN_T21_2SET_MODIFIER);
  }

  item() {
    return {
      id: `spell-${SPELLS.RET_PALADIN_T21_2SET_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.RET_PALADIN_T21_2SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.RET_PALADIN_T21_2SET_BONUS.id} icon={false} />,
      result: (
        <dfn data-tip={`
          The effective damage contributed by tier 21 2 peice.<br/>
          Damage: ${this.owner.formatItemDamageDone(this.damageDone)}<br/>
          Total Damage: ${formatNumber(this.damageDone)}`}>
          <ItemDamageDone amount={this.damageDone} />
        </dfn>
      ),
    };
  }
}

export default Tier21_2set;
