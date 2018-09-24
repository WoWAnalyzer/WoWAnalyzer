import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticListBoxItem from 'Interface/Others/StatisticListBoxItem';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class Ascendance extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.ASCENDANCE_HEAL.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.ASCENDANCE_HEAL.id);
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.ASCENDANCE_TALENT_RESTORATION.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))} %`}
      />
    );
  }

}

export default Ascendance;

