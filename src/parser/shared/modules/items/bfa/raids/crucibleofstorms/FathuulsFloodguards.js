import React from 'react';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

// Example log: https://www.warcraftlogs.com/reports/Px9pcQwt3rFXjDn7#fight=24&source=186

class FathuulsFloodguards extends Analyzer {
  damage = 0;
  healing = 0;
  overHealing = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasLegs(ITEMS.FATHUULS_FLOODGUARDS.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DROWNING_TIDE_DAMAGE), this._damage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DROWNING_TIDE_HEAL), this._heal);
  }

  _damage(event){
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  _heal(event){
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }

  get overhealPercent() {
    return this.overHealing / (this.healing + this.overHealing);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.FATHUULS_FLOODGUARDS}>
          <TooltipElement content={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
            </TooltipElement><br />
          <TooltipElement content={`Healing done: ${formatNumber(this.healing)} (${formatPercentage(this.overhealPercent)}% OH)`}>
            <ItemHealingDone amount={this.healing} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default FathuulsFloodguards;
