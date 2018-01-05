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
    if (event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      // We track Crackling Jade Lightning differently
      return;
    }
    if (event.ability.guid === SPELLS.FISTS_OF_FURY_CAST.id) {
      this.beginChannel(event);
      return;
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.CRACKLING_JADE_LIGHTNING.id) || this.isChannelingSpell(SPELLS.FISTS_OF_FURY_CAST.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Channeling', 'Marking', this._currentChannel.ability.name, 'as ended since we started casting something else');
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      return;
    }
    this.beginChannel(event);
  }

  // Looking at `removebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.CRACKLING_JADE_LIGHTNING.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.FISTS_OF_FURY_CAST.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.FISTS_OF_FURY_CAST.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
}
export default Channeling;
