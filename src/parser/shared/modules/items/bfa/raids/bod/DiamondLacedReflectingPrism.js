import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

// Example log: https://www.warcraftlogs.com/reports/JQPygMZdB6LDcaRj#fight=18&source=8

class DiamondLacedReflectingPrism extends Analyzer {

  absorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DIAMOND_LACED_REFLECTING_PRISM.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.DIAMOND_BARRIER), this._absorb);
  }

  _absorb(event){
    this.absorbed += (event.amount || 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.DIAMOND_LACED_REFLECTING_PRISM}>
          <TooltipElement content={`Damage absorbed: ${formatNumber(this.absorbed)}`}>
            <ItemHealingDone amount={this.absorbed} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default DiamondLacedReflectingPrism;
