import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import { formatMilliseconds } from 'common/format';

/**
 * Crackling Jade Lightning don't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 * Combatlog event order is messy, it often looks like:
 * 1. applydebuff Crackling Jade Lightning
 * 2. begincast/cast new spell
 * 3. removedebuff Crackling Jade Lightning
 * To avoid Crackling Jade Lightning as being marked "canceled" when we start a new spell we mark it as ended instead on the begincast/cast.
 */
class Channeling extends CoreChanneling {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FURY_OF_THE_EAGLE_TRAIT.id) {
      this.beginChannel(event);
      return;
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.FURY_OF_THE_EAGLE_TRAIT.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Channeling', 'Marking', this._currentChannel.ability.name, 'as ended since we started casting something else');
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.FURY_OF_THE_EAGLE_TRAIT.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.FURY_OF_THE_EAGLE_TRAIT.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
}

export default Channeling;
