import Module from 'Main/Parser/Module';

export const OBSIDIAN_STONE_SPAULDERS_ITEM_ID = 137076;
const OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID = 210999;

class ObsidianStoneSpaulders extends Module {
  healing = 0;

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      const spellId = event.ability.guid;
      if (spellId === OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID) {
        this.healing += event.amount;
      }
    }
  }
}

export default ObsidianStoneSpaulders;
