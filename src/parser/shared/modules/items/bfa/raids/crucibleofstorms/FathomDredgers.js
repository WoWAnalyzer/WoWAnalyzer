import React from 'react';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemHealingDone from 'interface/ItemHealingDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

// Example log: https://www.warcraftlogs.com/reports/vZQfwra1xVK76M4L/#fight=13&source=6

class FathomDredgers extends Analyzer {

  absorbed = 0;
  wastedAbsorb = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasHands(ITEMS.FATHOM_DREDGERS.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.DREDGED_VITALITY), this._absorb);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.DREDGED_VITALITY), this._removebuff);
    this.addEventListener(Events.fightend, this._end);
  }

  _end(){
    const shield = this.selectedCombatant.getBuff(SPELLS.DREDGED_VITALITY.id);
    if (shield !== undefined) {
      this.wastedAbsorb += (shield.absorb || 0);
    }
  }

  _removebuff(event) {
    this.wastedAbsorb += (event.absorb || 0);
  }

  _absorb(event) {
    this.absorbed += event.amount;
  }

  get possibleAbsorb() {
    return this.absorbed + this.wastedAbsorb;
  }


  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={`Absorb utilized: ${formatNumber(this.absorbed)} / ${formatNumber(this.possibleAbsorb)} (${formatPercentage(this.absorbed / this.possibleAbsorb)} %)`}
      >
        <BoringItemValueText item={ITEMS.FATHOM_DREDGERS}>
          <TooltipElement content={`Damage absorbed: ${formatNumber(this.absorbed)}`}>
            <ItemHealingDone amount={this.absorbed} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default FathomDredgers;
