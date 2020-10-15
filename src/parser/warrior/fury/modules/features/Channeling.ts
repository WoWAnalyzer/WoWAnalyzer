import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';

class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
  };

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    // Begin channeling when the bladestorm buff is applied.
    if (SPELLS.BLADESTORM_TALENT.id === event.ability.guid) {
      this.beginChannel(event);
      return;
    }

    super.on_byPlayer_cast(event);
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    // End channeling when the bladestorm buff is removed.
    if (SPELLS.BLADESTORM_TALENT.id === event.ability.guid) {
      this.endChannel(event);
    }
  }

  on_byPlayer_cast(event: CastEvent) {
    // Bladestorm triggers multiple cast successes after the buff is applied which would cancel the channel, so we manually ignore those here.
    if (SPELLS.BLADESTORM_TALENT.id !== event.ability.guid) {
      super.on_byPlayer_cast(event);
    }
  }
}

export default Channeling;
