import React from 'react';
import SPELLS from 'common/SPELLS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SpellIcon from 'common/SpellIcon';
import ItemHealingDone from 'interface/ItemHealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class InvokeChiJi extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    if (!this.active) return;
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI), this.handleGust);
  }

  handleGust(event) {
    this.healing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(50)}
        icon={<SpellIcon id={SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id} />}
        value={<ItemHealingDone amount={this.healing} />}
        label="Chi-Ji Healing"
      />
    );
  }
}

export default InvokeChiJi;
