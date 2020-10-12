import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent } from 'parser/core/Events';

import CoreHealingDone from 'parser/shared/modules/throughput/HealingDone';

class HealingDone extends CoreHealingDone {
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.STAGGER), this.onStagger);
  }

  onStagger(event: AbsorbedEvent) {
    // This is the same correction as damage taken for Brewmaster monks
    // When stagger removes damage from an attack it is not a true heal but just delays the damage to be taken by a dot
    // this needs to be subtrached from the damage taken but also the healing done.

    this._subtractHealingByAbsorb(event, event.amount, 0, 0);
  }
}

export default HealingDone;
