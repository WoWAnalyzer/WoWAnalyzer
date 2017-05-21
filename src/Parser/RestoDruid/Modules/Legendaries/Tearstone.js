import Module from 'Main/Parser/Module';
import { WILD_GROWTH_HEAL_SPELL_ID, REJUVENATION_HEAL_SPELL_ID, REJUVENATION_GERMINATION_HEAL_SPELL_ID, TREE_OF_LIFE_CAST_ID} from 'Main/Parser/Constants';

export const TEARSTONE_ITEM_ID = 137042;

class Tearstone extends Module {
  rejuvs = 0;
  wildgrowthTimestamp = null;
  wildGrowths = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (WILD_GROWTH_HEAL_SPELL_ID === spellId) {
      this.wildgrowthTimestamp = event.timestamp;
      if(this.owner.selectedCombatant.hasBuff(TREE_OF_LIFE_CAST_ID)){
        this.wildGrowths += 8;
      } else {
        this.wildGrowths += 6;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if((REJUVENATION_HEAL_SPELL_ID === spellId || REJUVENATION_GERMINATION_HEAL_SPELL_ID == spellId) && (event.timestamp - this.wildgrowthTimestamp) < 200) {
      this.rejuvs++;
    }
  }
}

export default Tearstone;
