import React from 'react';

import SPELLS from 'common/SPELLS';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemHealingDone from 'interface/ItemHealingDone';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

/**
 * Your healing effects have a chance to grant the target X additional healing
 * every 2 sec for 12 sec. This effect doubles every 2 sec.
 */
class ConcentratedMending extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CONCENTRATED_MENDING.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CONCENTRATED_MENDING_HEALING), this.onHeal);
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="small"
      >
        <BoringSpellValueText
          spell={SPELLS.CONCENTRATED_MENDING}
        >
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default ConcentratedMending;
