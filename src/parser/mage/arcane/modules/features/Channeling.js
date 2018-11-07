import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';

class Channeling extends CoreChanneling {

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCANE_MISSILES.id || spellId === SPELLS.EVOCATION.id) {
      this.beginChannel(event);
      return;
    }
    super.on_byPlayer_cast(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.EVOCATION.id) {
      if (this.isChannelingSpell(SPELLS.EVOCATION.id)) {
        this.endChannel(event);
      }
    }
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.ARCANE_MISSILES.id) || this.isChannelingSpell(SPELLS.EVOCATION.id)) {
      this.endChannel(event);
      return;
    }
    super.cancelChannel(event, ability);
  }

}

export default Channeling;
