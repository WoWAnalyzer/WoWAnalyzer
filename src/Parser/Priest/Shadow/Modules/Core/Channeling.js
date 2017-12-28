import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';

/**
 * Mind Flay and Void Torrent don't reveal in the combatlog when channeling begins and ends, this fabricates the required events so that ABC can handle it properly.
 */
class Channeling extends CoreChanneling {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id) {
      // We track Mind Flay differently
      return;
    }
    if (event.ability.guid === SPELLS.VOID_TORRENT.id) {
      // We track Mind Flay differently
      return;
    }
    super.on_byPlayer_cast(event);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id) {
      this.beginChannel(event);
    }
    if (event.ability.guid === SPELLS.VOID_TORRENT.id) {
      this.beginChannel(event);
    }
  }

  // Looking at `removebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  on_byPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id) {
      this.endChannel(event);
    }
    if (event.ability.guid === SPELLS.VOID_TORRENT.id) {
      this.endChannel(event);
    }
  }
}

export default Channeling;
