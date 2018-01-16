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

  wildGrowthApplications = 0;
  wildGrowthCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.TEARSTONE_OF_ELUNE.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.WILD_GROWTH.id) {
      this.wildGrowthCasts += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.WILD_GROWTH.id) {
      this.wildGrowthApplications += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.WILD_GROWTH.id) {
      this.wildGrowthApplications += 1;
    }
  }

  get directHealing() {
    return this.rejuvenationAttributor.tearstoneOfElune.healing;
  }
  get masteryHealing() {
    return this.rejuvenationAttributor.tearstoneOfElune.masteryHealing;
  }
  get dreamwalkerHealing() {
    return this.rejuvenationAttributor.tearstoneOfElune.dreamwalkerHealing;
  }
  get totalHealing() {
    return this.directHealing + this.masteryHealing + this.dreamwalkerHealing;
  }
  get procs() {
    return this.rejuvenationAttributor.tearstoneOfElune.procs;
  }
  get procRate() {
    return (this.procs / this.wildGrowthApplications) || 0;
  }
  get procsPerCast() {
    return (this.procs / this.wildGrowthCasts) || 0;
  }

  item() {
    return {
      item: ITEMS.TEARSTONE_OF_ELUNE,
      result: (
        <dfn data-tip={`Over ${this.wildGrowthCasts} Wild Growth casts and ${this.wildGrowthApplications} Wild Growth HoT applications, you procced <b>${this.procs}</b> Rejuvenations. This is <b>${this.procsPerCast.toFixed(2)}</b> bonus Rejuvs per Wild Growth cast, and a proc rate of <b>${formatPercentage(this.procRate)}%</b> on each Wild Growth HoT application. <br><br>The reported healing value is the sum of the direct healing from those Rejuvenations, the healing enabled by their extra mastery stacks, and the healing enabled by extra Dreamwalker procs.
            <ul>
            <li>Direct: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.directHealing))}%</b></li>
            <li>Mastery: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.masteryHealing))}%</b></li>
            <li>Dreamwalker: <b>${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.dreamwalkerHealing))}%</b></li>
            </ul>`}>
          <ItemHealingDone amount={this.totalHealing} />
        </dfn>
      ),
    };
  }
}

export default Tearstone;
