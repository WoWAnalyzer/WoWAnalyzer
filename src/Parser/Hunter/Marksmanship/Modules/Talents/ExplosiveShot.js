import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber } from "common/format";

class ExplosiveShot extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EXPLOSIVE_SHOT_SHOT.id) {
      return;
    }
    this.damage += event.amount;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EXPLOSIVE_SHOT_TALENT.id} />}
        value={`${formatNumber(this.damage)}`}
        label={this.owner.formatItemDamageDone(this.damage)}
      />
    );
  }
}

export default ExplosiveShot;
