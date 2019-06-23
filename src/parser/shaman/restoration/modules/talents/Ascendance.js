import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

class Ascendance extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ASCENDANCE_HEAL), this._onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ASCENDANCE_INITIAL_HEAL), this._onHeal);
  }

  _onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  get feeding() {
    return this.cooldownThroughputTracker.getIndirectHealing(SPELLS.ASCENDANCE_HEAL.id) + this.cooldownThroughputTracker.getIndirectHealing(SPELLS.ASCENDANCE_INITIAL_HEAL.id);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.ASCENDANCE_TALENT_RESTORATION.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.feeding))} %`}
      />
    );
  }

}

export default Ascendance;

