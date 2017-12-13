import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";

const T21_2P_MODIFIER = 0.1;

class Tier21_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T21_2P_BONUS.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_PET.id) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, T21_2P_MODIFIER);
  }
  item() {
    return {
      id: `spell-${SPELLS.HUNTER_BM_T21_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_BM_T21_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_BM_T21_2P_BONUS.id} />,
      result: (
        <dfn>
          {formatNumber(this.bonusDmg)} - {this.owner.formatItemDamageDone(this.bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default Tier21_2p;
