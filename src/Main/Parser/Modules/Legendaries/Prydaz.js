import ITEMS from 'common/ITEMS';

import Module from 'Main/Parser/Module';

const PRYDAZ_HEAL_SPELL_ID = 207472;

class Prydaz extends Module {
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasNeck(ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id);
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === PRYDAZ_HEAL_SPELL_ID) {
      this.healing += event.amount;
    }
  }
}

export default Prydaz;
