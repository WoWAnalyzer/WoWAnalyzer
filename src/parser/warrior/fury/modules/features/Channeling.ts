import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
  };

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveBuff);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    // Begin channeling when the bladestorm buff is applied.
    if (SPELLS.BLADESTORM_TALENT.id === event.ability.guid) {
      this.beginChannel(event);
      return;
    }

    super.onCast(event);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    // End channeling when the bladestorm buff is removed.
    if (SPELLS.BLADESTORM_TALENT.id === event.ability.guid) {
      this.endChannel(event);
    }
  }

  onCast(event: CastEvent) {
    // Bladestorm triggers multiple cast successes after the buff is applied which would cancel the channel, so we manually ignore those here.
    if (SPELLS.BLADESTORM_TALENT.id !== event.ability.guid) {
      super.onCast(event);
    }
  }
}

export default Channeling;
