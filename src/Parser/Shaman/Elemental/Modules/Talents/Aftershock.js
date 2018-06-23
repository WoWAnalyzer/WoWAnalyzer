import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Aftershock extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  refund = 0;

  constructor(...args) {
    super(...args);
    this.active = this.combatants.selected.hasTalent(SPELLS.AFTERSHOCK_TALENT.id);
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid === SPELLS.AFTERSHOCK.id) {
      this.refund += event.resourceChange;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AFTERSHOCK_TALENT.id} />}
        value={`${formatNumber(this.refund)}`}
        label="Maelstrom refunded"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Aftershock;
