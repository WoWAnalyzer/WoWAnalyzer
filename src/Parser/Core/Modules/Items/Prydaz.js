import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Prydaz, Xavaric's Magnum Opus -
 * Equip: Every 30 sec, gain an absorb shield for 25% of your maximum health for 30 sec.
 */
class Prydaz extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasNeck(ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id);
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.XAVARICS_MAGNUM_OPUS.id) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS,
      result: `${this.owner.formatItemHealingDone(this.healing)}`,
    };
  }
}

export default Prydaz;
