import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

import CoreHealingDone from 'parser/shared/modules/throughput/HealingDone';

class HealingDone extends CoreHealingDone {
  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE), this.onSLTDamage);
  }

  onSLTDamage(event: DamageEvent) {
    // Removing Spirit link from total healing done by subtracting the damage done of it
    this._subtractHealing(event, event.amount, 0, 0);
  }
}

export default HealingDone;
