import SPELLS from 'common/SPELLS';
import CoreChanneling from 'Parser/Core/Modules/Channeling';

class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
  };

  on_byPlayer_applybuff(event) {
    if (super.on_byPlayer_applybuff) {
      super.on_byPlayer_applybuff(event);
    }

    // Begin channeling when the bladestorm buff is applied.
    if (SPELLS.BLADESTORM.id === event.ability.guid) {
      this.beginChannel(event);
    }
  }

  on_byPlayer_removebuff(event) {
    if (super.on_byPlayer_removebuff) {
      super.on_byPlayer_removebuff(event);
    }

    // End channeling when the bladestorm buff is removed.
    if (SPELLS.BLADESTORM.id === event.ability.guid) {
      this.endChannel(event);
    }
  }

  on_byPlayer_cast(event) {
    // Bladestorm triggers multiple cast successes after the buff is applied which would cancel the channel, so we manually ignore those here.
    if (SPELLS.BLADESTORM.id !== event.ability.guid) {
      super.on_byPlayer_cast(event);
    }
  }
}

export default Channeling;
