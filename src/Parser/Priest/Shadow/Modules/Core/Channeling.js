import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';
import { formatMilliseconds } from 'common/format';

/**
 * Mind Flay and Void Torrent don't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 */
class Channeling extends CoreChanneling {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id || event.ability.guid === SPELLS.VOID_TORRENT.id) {
      this.beginChannel(event);
      return;
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.MIND_FLAY.id) || this.isChannelingSpell(SPELLS.VOID_TORRENT.id)) {
      // If a channeling spell is "canceled" it was actually just ended, so if it looks canceled then instead just mark it as ended
      console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Channeling', 'Marking', this._currentChannel.ability.name, 'as ended since we started casting something else');
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  // Looking at `removebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  on_byPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id || event.ability.guid === SPELLS.VOID_TORRENT.id) {
      this.endChannel(event);
    }
  }
}

export default Channeling;
