import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

export const TEARSTONE_ITEM_ID = 137042;

class Tearstone extends Module {
  rejuvs = 0;
  wildgrowthTimestamp = null;
  wildGrowths = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SPELLS.WILD_GROWTH.id === spellId) {
      this.wildgrowthTimestamp = event.timestamp;
      if (this.owner.selectedCombatant.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
        this.wildGrowths += 8;
      } else {
        this.wildGrowths += 6;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if ((SPELLS.REJUVENATION.id === spellId || SPELLS.REJUVENATION_GERMINATION.id === spellId) && (event.timestamp - this.wildgrowthTimestamp) < 200) {
      this.rejuvs++;
    }
  }
}

export default Tearstone;
