import React from 'react';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemDamageTaken from 'interface/others/ItemDamageTaken';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

// Example log: https://www.warcraftlogs.com/reports/K8ZDQLNhJGwBqWjC#fight=17&source=10

class GripsOfForsakenSanity extends Analyzer {
  damage = 0;
  damageTaken = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasHands(ITEMS.GRIPS_OF_FORSAKEN_SANITY.id);
    if(!this.active){
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPITEFUL_BINDING), this._damage);
  }

  _damage(event){
    const amount = (event.amount || 0) + (event.absorbed || 0);
    if(event.targetID === event.sourceID){
      this.damageTaken += amount;
    }else{
      this.damage += amount;
    }
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.GRIPS_OF_FORSAKEN_SANITY}>
          <TooltipElement content={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
            </TooltipElement><br />
          <TooltipElement content={`Damage taken: ${formatNumber(this.damageTaken)}`}>
            <ItemDamageTaken amount={this.damageTaken} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default GripsOfForsakenSanity;
