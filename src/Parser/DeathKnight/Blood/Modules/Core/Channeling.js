import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';

class Channeling extends CoreChanneling {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.BLOODDRINKER_TALENT.id) {
      // We track Blooddrinker
      return;
    }
    super.on_byPlayer_cast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.BLOODDRINKER_TALENT.id)) {
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.BLOODDRINKER_TALENT.id) {
      return;
    }
    this.beginChannel(event);
  }

  // Looking at `removebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  on_byPlayer_removedebuff(event) {
    if (event.ability.guid !== SPELLS.BLOODDRINKER_TALENT.id) {
      return;
    }
    if (!this.isChannelingSpell(SPELLS.BLOODDRINKER_TALENT.id)) {
      // This may be true if we did the event-order fix in begincast/cast and it was already ended there.
      return;
    }
    this.endChannel(event);
  }
}

export default Channeling;
