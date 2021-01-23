import React from 'react';

import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';

import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

class Ascendance extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;

  protected cooldownThroughputTracker!: CooldownThroughputTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.ASCENDANCE_HEAL, SPELLS.ASCENDANCE_INITIAL_HEAL]), this._onHeal);
  }

  _onHeal(event: HealEvent) {
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

