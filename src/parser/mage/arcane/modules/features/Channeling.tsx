import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import { CastEvent, RemoveBuffEvent } from 'parser/core/Events';

class Channeling extends CoreChanneling {

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCANE_MISSILES.id || spellId === SPELLS.EVOCATION.id) {
      this.beginChannel(event);
      return;
    }
    super.on_byPlayer_cast(event);
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    // This will resolve potential issues with evocation showing longer channel times
    if (event.ability.guid === SPELLS.EVOCATION.id && this.isChannelingSpell(SPELLS.EVOCATION.id)) {
      this.endChannel(event);
    }
  }

  cancelChannel(event: any, ability: any) {
    if (this.isChannelingSpell(SPELLS.ARCANE_MISSILES.id) || this.isChannelingSpell(SPELLS.EVOCATION.id)) {
      this.endChannel(event);
      return;
    }
    super.cancelChannel(event, ability);
  }

}

export default Channeling;
