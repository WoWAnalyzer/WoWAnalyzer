import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatThousands } from 'common/format';

class TrailOfLight extends Analyzer {

  totalHealing = 0;
  overhealing = 0;
  absorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_LIGHT_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TRAIL_OF_LIGHT_HEAL.id) {
      return;
    }
    this.overhealing += event.overheal || 0;
    this.totalHealing+= (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (

      <StatisticBox
        icon={<SpellIcon id={SPELLS.TRAIL_OF_LIGHT_TALENT.id} />}
        value={this.owner.formatItemHealingDone(this.totalHealing)}
        label="Trail Of Light Healing"
        tooltip={`<strong>Total Healing:</strong> ${formatThousands(this.totalHealing)}<br>
                  <strong>Total Overhealing:</strong> ${formatThousands(this.overhealing)}`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default TrailOfLight;
