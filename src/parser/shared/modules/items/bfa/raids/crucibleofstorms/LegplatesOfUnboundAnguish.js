import React from 'react';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemDamageTaken from 'interface/ItemDamageTaken';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

// Example log: https://www.warcraftlogs.com/reports/dFc9GAjyvK2MCxJ1#fight=10&source=6

class LegplatesOfUnboundAnguish extends Analyzer {

  damage = 0;
  damageTaken = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasLegs(ITEMS.LEGPLATES_OF_UNBOUND_ANGUISH.id);
    if(!this.active){
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_ANGUISH_DAMAGE), this._damage);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER).spell(SPELLS.UNBOUND_ANGUISH_SACRIFICE), this._sacrifice);
  }

  _damage(event) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  _sacrifice(event) {
    this.damageTaken += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.LEGPLATES_OF_UNBOUND_ANGUISH}>
          <TooltipElement content={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
            </TooltipElement><br />
          <TooltipElement content={`Health sacrificed: ${formatNumber(this.damageTaken)}`}>
            <ItemDamageTaken amount={this.damageTaken} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

}

export default LegplatesOfUnboundAnguish;
