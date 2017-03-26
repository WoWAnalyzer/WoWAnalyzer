import Module from 'Main/Parser/Module';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'Main/Parser/Constants';

export const OBSIDION_STONE_SPAULDERS_ITEM_ID = 137076;
const OBSIDION_STONE_SPAULDERS_HEAL_SPELL_ID = 210999;

class ObsidianStoneSpaulders extends Module {
  healing = 0;

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      const spellId = event.ability.guid;
      if (spellId === OBSIDION_STONE_SPAULDERS_HEAL_SPELL_ID) {
        this.healing += event.amount;
      }
    }
  }
}

export default ObsidianStoneSpaulders;
