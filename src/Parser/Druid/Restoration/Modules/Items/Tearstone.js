import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

//import Rejuvenation from '../Core/Rejuvenation';
import HotTracker from '../Core/HotTracker';

class Tearstone extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  //  rejuvenation: Rejuvenation,
    hotTracker: HotTracker
  };

  // rejuvs = 0;
  // rejuvTimestamp = null;
  // rejuvTarget = null;
  // wildgrowthTimestamp = null;
  // wildGrowthTargets = [];
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

  // on_byPlayer_cast(event) {
  //   const spellId = event.ability.guid;
  //
  //   // track rejuv being casted so we don't count a casted rejuv as tearstone proc
  //   if (SPELLS.REJUVENATION.id === spellId) {
  //     this.rejuvTimestamp = event.timestamp;
  //     this.rejuvTarget = event.targetID;
  //   }
  //
  //   // track WG being casted, without WG there's no tearstone procs
  //   if (SPELLS.WILD_GROWTH.id === spellId) {
  //     this.wildgrowthTimestamp = event.timestamp;
  //     this.wildGrowthTargets = [];
  //     if (this.combatants.selected.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
  //       this.wildGrowths += 8;
  //     } else {
  //       this.wildGrowths += 6;
  //     }
  //   }
  // }
  //
  // on_byPlayer_applybuff(event) {
  //   const spellId = event.ability.guid;
  //
  //   // add WG targets so we can check against those for rejuv buffs
  //   if (SPELLS.WILD_GROWTH.id === spellId && (event.timestamp - this.wildgrowthTimestamp) < 200) {
  //     this.wildGrowthTargets.push(event.targetID);
  //     return;
  //   }
  //
  //   // check if this is a rejuv that was casted
  //   if ((SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId)
  //     && event.targetID === this.rejuvTarget && (event.timestamp - this.rejuvTimestamp) < 200) {
  //     // "consume" the rejuv cast we were tracking
  //     this.rejuvTarget = null;
  //     this.rejuvTimestamp = null;
  //     return;
  //   }
  //
  //   if ((SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId)
  //     && (event.timestamp - this.wildgrowthTimestamp) < 200
  //     && this.wildGrowthTargets.indexOf(event.targetID) !== -1) {
  //     this.rejuvs += 1;
  //   }
  // }

  get directHealing() {
    return this.hotTracker.tearstoneOfElune.healing;
  }

  get masteryHealing() {
    return this.hotTracker.tearstoneOfElune.masteryHealing;
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  get procs() {
    return this.hotTracker.tearstoneOfElune.procs;
  }

  get procRate() {
    return this.procs / this.wildGrowths;
  }

  item() {
    // const healing = this.rejuvs * this.rejuvenation.avgRejuvHealing;
    // const procRate = this.rejuvs / this.wildGrowths;

    return {
      item: ITEMS.TEARSTONE_OF_ELUNE,
      // result: (
      //   <dfn data-tip={`You gained <b>${this.rejuvs} bonus rejuvenations</b>, for a <b>proc rate of ${formatPercentage(procRate)}%</b>.`}>
      //     <ItemHealingDone amount={healing} />
      //   </dfn>
      // ),
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
