import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import {formatNumber} from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import Analyzer from 'parser/core/Analyzer';

/**
 * Equip: Your attacks have a chance to cause a Void Sector,
 * instantly dealing 5814 Shadow damage split among all targets in a cone in front of you.
 *
 * Example log:
 */

class DiscOfSystematicRegression extends Analyzer {
  totalDamage = 0;
  hits = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DISC_OF_SYSTEMATIC_REGRESSION.id);
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.VOIDED_SECTORS.id){
      this.totalDamage += (event.amount || 0) + (event.absorbed || 0);
      this.hits += 1;
    }
  }

  item(){
    return {
      item: ITEMS.DISC_OF_SYSTEMATIC_REGRESSION,
      result: (
        <TooltipElement content={<>Hit <strong>{this.hits}</strong> times for an average of <strong>{formatNumber(this.totalDamage/this.hits)}</strong> damage per hit.</>}>
          <ItemDamageDone amount={this.totalDamage} />
        </TooltipElement>
      ),
    };
  }
}

export default DiscOfSystematicRegression;
