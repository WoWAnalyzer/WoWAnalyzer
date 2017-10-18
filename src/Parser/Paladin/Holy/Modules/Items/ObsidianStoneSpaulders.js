import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID = 210999;

class ObsidianStoneSpaulders extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.OBSIDIAN_STONE_SPAULDERS.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === OBSIDIAN_STONE_SPAULDERS_HEAL_SPELL_ID) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.OBSIDIAN_STONE_SPAULDERS,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
}

export default ObsidianStoneSpaulders;
