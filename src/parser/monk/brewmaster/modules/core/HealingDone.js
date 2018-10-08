import SPELLS from 'common/SPELLS';

import CoreHealingDone from 'parser/shared/modules/HealingDone';

class HealingDone extends CoreHealingDone {
  on_toPlayer_absorbed(event) {
    // This is the same correction as damage taken for Brewmaster monks
    // When stagger removes damage from an attack it is not a true heal but just delays the damage to be taken by a dot
    // this needs to be subtrached from the damage taken but also the healing done.

    const spellId = event.ability.guid;
    if (spellId === SPELLS.STAGGER.id) {
      this._subtractHealingByAbsorb(event, event.amount, 0, 0);
    }
  }
}

export default HealingDone;
