import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events, {RemoveBuffEvent, CastEvent} from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

class Channeling extends CoreChanneling {

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveBuff);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.EYE_BEAM.id) {
      this.beginChannel(event);
      return;
    }
    super.onCast(event);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.EYE_BEAM.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.EYE_BEAM.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }

  cancelChannel(event: any, ability: any) {
    if (this.isChannelingSpell(SPELLS.EYE_BEAM.id)) {
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }
}

export default Channeling;
