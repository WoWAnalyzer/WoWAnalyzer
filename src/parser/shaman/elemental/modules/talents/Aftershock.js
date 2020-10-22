import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

class Aftershock extends Analyzer {
  refund = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AFTERSHOCK_TALENT.id);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.AFTERSHOCK), this.onEnergize);
  }

  onEnergize(event) {
    this.refund += event.resourceChange;
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
