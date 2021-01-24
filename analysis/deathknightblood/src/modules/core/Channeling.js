import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

class Channeling extends CoreChanneling {
  constructor(options) {
    super(options);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER), this.onRemoveDebuff);
  }
  onCast(event) {
    if (event.ability.guid === SPELLS.BLOODDRINKER_TALENT.id) {
      // We track Blooddrinker
      return;
    }
    super.onCast(event);
  }

  cancelChannel(event, ability) {
    if (this.isChannelingSpell(SPELLS.BLOODDRINKER_TALENT.id)) {
      this.endChannel(event);
    } else {
      super.cancelChannel(event, ability);
    }
  }

  onApplyDebuff(event) {
    if (event.ability.guid !== SPELLS.BLOODDRINKER_TALENT.id) {
      return;
    }
    this.beginChannel(event);
  }

  // Looking at `removebuff` will includes progress towards a tick that never happened. This progress could be considered downtime as it accounts for nothing.
  // If it's ever decided to consider the time between last tick and channel ending as downtime, just change the endchannel trigger.
  onRemoveDebuff(event) {
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
