import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

const OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID = 210999;

class ObsidianStoneSpaulders extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasShoulder(ITEMS.OBSIDIAN_STONE_SPAULDERS.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID) {
      this.healing += event.amount;
    }
  }
}

export default ObsidianStoneSpaulders;
