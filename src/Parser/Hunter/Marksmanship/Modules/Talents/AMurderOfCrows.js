import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber } from "common/format";

class AMurderOfCrows extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id);
  }

  //TODO: Add some sort of HP checker for the casts to ensure it isn't cast at below 25% hp (maybe)
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.A_MURDER_OF_CROWS_SPELL.id) {
      return;
    }
    this.damage += event.amount;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} />}
        value={`${formatNumber(this.damage)}`}
        label={this.owner.formatItemDamageDone(this.damage)}
      />
    );
  }
}

export default AMurderOfCrows;
