import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events, { CastEvent, RemoveBuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

const debug = false;

class Channeling extends CoreChanneling {

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BARRAGE_TALENT), this.onRemoveBarrageBuff);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.RAPID_FIRE), this.removeRapidFire);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BARRAGE_TALENT.id || spellId === SPELLS.RAPID_FIRE.id) {
      this.beginChannel(event);
      return;
    }
    super.onCast(event);
  }

  cancelChannel(event: any, ability: any) {
    if (this.isChannelingSpell(SPELLS.BARRAGE_TALENT.id) || this.isChannelingSpell(SPELLS.RAPID_FIRE.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      debug && this.log('Marking', this._currentChannel.ability.name, 'as ended since we started casting something else');
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  removeRapidFire(event: RemoveDebuffEvent) {
    if (!this.isChannelingSpell(SPELLS.RAPID_FIRE.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }

  onRemoveBarrageBuff(event: RemoveBuffEvent) {
    if (!this.isChannelingSpell(SPELLS.BARRAGE_TALENT.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
}

export default Channeling;
