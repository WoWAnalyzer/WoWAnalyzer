import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

class Channeling extends CoreChanneling {

  constructor(options: Options){
    super(options);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CONVOKE_SPIRITS.id) {
      this.beginChannel(event);
      return;
    }
    super.onCast(event);
  }

  cancelChannel(event: any, ability: any) {
    if (this.isChannelingSpell(SPELLS.CONVOKE_SPIRITS.id)) {
      this.endChannel(event);
      return;
    }
    super.cancelChannel(event, ability);
  }

}

export default Channeling;
