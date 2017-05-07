import ITEMS from 'common/ITEMS';

import Module from 'Main/Parser/Module';

const OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID = 210999;

class ObsidianStoneSpaulders extends Module {
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasShoulder(ITEMS.OBSIDIAN_STONE_SPAULDERS.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID) {
      this.healing += event.amount;
    }
  }
}

export default ObsidianStoneSpaulders;
