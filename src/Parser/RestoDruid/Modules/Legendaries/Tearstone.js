import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

export const TEARSTONE_ITEM_ID = 137042;

class Tearstone extends Module {
  rejuvs = 0;
  rejuvTimestamp = null;
  rejuvTarget = null;
  wildgrowthTimestamp = null;
  wildGrowthTargets = [];
  wildGrowths = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    // track rejuv being casted so we don't count a casted rejuv as tearstone proc
    if (SPELLS.REJUVENATION.id === spellId) {
      this.rejuvTimestamp = event.timestamp;
      this.rejuvTarget = event.targetID;
    }

    // track WG being casted, without WG there's no tearstone procs
    if (SPELLS.WILD_GROWTH.id === spellId) {
      this.wildgrowthTimestamp = event.timestamp;
      this.wildGrowthTargets = [];
      if (this.owner.modules.combatants.selected.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
        this.wildGrowths += 8;
      } else {
        this.wildGrowths += 6;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    // add WG targets so we can check against those for rejuv buffs
    if (SPELLS.WILD_GROWTH.id === spellId && (event.timestamp - this.wildgrowthTimestamp) < 200) {
      this.wildGrowthTargets.push(event.targetID);
      return;
    }

    // check if this is a rejuv that was casted
    if ((SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId)
     && event.targetID === this.rejuvTarget && (event.timestamp - this.rejuvTimestamp) < 200) {
      // "consume" the rejuv cast we were tracking
      this.rejuvTarget = null;
      this.rejuvTimestamp = null;
        return;
    }

    if ((SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId)
      && (event.timestamp - this.wildgrowthTimestamp) < 200
      && this.wildGrowthTargets.indexOf(event.targetID) !== -1) {
      this.rejuvs += 1;
    }
  }
}

export default Tearstone;
