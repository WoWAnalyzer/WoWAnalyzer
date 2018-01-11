import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import RejuvenationAttributor from '../Core/HotTracking/RejuvenationAttributor';

class Tearstone extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    rejuvenationAttributor: RejuvenationAttributor,
  };

  wildGrowths = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.TEARSTONE_OF_ELUNE.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.WILD_GROWTH.id === spellId) {
        if (this.combatants.selected.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
          this.wildGrowths += 8;
        } else {
          this.wildGrowths += 6;
        }
      }
  }

  get directHealing() {
    return this.rejuvenationAttributor.tearstoneOfElune.healing;
  }
  get masteryHealing() {
    return this.rejuvenationAttributor.tearstoneOfElune.masteryHealing;
  }
  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }
  get procs() {
    return this.rejuvenationAttributor.tearstoneOfElune.procs;
  }
  get procRate() {
    return this.procs / this.wildGrowths;
  }

  item() {
    return {
      item: ITEMS.TEARSTONE_OF_ELUNE,
      result: (
        <dfn data-tip={`You procced <b>${this.procs}</b> Rejuvenations, for a <b>proc rate of ${formatPercentage(this.procRate)}%</b>. This is the sum of the direct healing from those Rejuvernations and the healing enabled by their extra mastery stacks.
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directHealing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.masteryHealing))}%</b></li>
            </ul>`}>
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }
}

export default Tearstone;
