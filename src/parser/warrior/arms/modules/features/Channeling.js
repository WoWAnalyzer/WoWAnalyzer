import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

class Channeling extends CoreChanneling {
  static dependencies = {
    ...CoreChanneling.dependencies,
  };

  constructor(options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM), this.onRemoveBuff);
  }

  onApplyBuff(event) {
    // Begin channeling when the bladestorm buff is applied.
    this.beginChannel(event);
  }

  onRemoveBuff(event) {
    // End channeling when the bladestorm buff is removed.
    this.endChannel(event);
  }

  onCast(event) {
    // Bladestorm triggers multiple cast successes after the buff is applied which would cancel the channel, so we manually ignore those here.
    if (SPELLS.BLADESTORM.id !== event.ability.guid) {
      super.onCast(event);
    }
  }
}

export default Channeling;
