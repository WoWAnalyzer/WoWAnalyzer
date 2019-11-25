import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

// Example log: https://www.warcraftlogs.com/reports/9hL1MGxnC6TXPRKt#fight=19&source=1&type=healing

class BloodthirstyUrchin extends Analyzer {

  healing = 0;
  overHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.BLOODTHIRSTY_URCHIN.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.to(SELECTED_PLAYER).spell(SPELLS.BLOODTHIRSTY_URCHIN_HEAL), this._heal);
  }

  _heal(event){
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }

  get overhealPercent() {
    return this.overHealing / this.healing;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.BLOODTHIRSTY_URCHIN}>
          <TooltipElement content={`Healing done: ${formatNumber(this.healing)} (${formatPercentage(this.overhealPercent)}% OH)`}>
            <ItemHealingDone amount={this.healing} />
            </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default BloodthirstyUrchin;
