import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'interface/ItemDamageDone';
import {formatNumber} from 'common/format';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

/**
 * Equip: Your attacks have a chance to cause a Void Sector,
 * instantly dealing 5814 Shadow damage split among all targets in a cone in front of you.
 *
 * Example log: /report/M6pj4mXbW7BHQnGf/67-LFR+Champion+of+the+Light+-+Kill+(1:56)/Gumbojack
 */

class DiscOfSystematicRegression extends Analyzer {
  totalDamage = 0;
  hits = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DISC_OF_SYSTEMATIC_REGRESSION.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOIDED_SECTORS), this.onDamage);
  }

  onDamage(event){
    this.totalDamage += (event.amount || 0) + (event.absorbed || 0);
    this.hits += 1;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Hit <strong>{this.hits}</strong> times for an average of <strong>{formatNumber(this.totalDamage/this.hits)}</strong> damage per hit.</>}
      >
        <BoringItemValueText item={ITEMS.DISC_OF_SYSTEMATIC_REGRESSION}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default DiscOfSystematicRegression;
