import SPELLS from 'common/SPELLS';
import { GlobalCooldownEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

class GlobalCooldown extends CoreGlobalCooldown {
  _verifyAccuracy(event: GlobalCooldownEvent) {
    if (
      event.ability.guid === SPELLS.SHIELD_CHARGE.id ||
      this.lastGlobalCooldown?.ability.guid === SPELLS.SHIELD_CHARGE.id
    ) {
      // Shield Charge is on the GCD in-game, but WCL timestamps its cast at impact
      // It can appear inside the previous GCD, and follow-up casts can appear inside its logged GCD
      this.lastGlobalCooldown = event;
      return;
    }

    super._verifyAccuracy(event);
  }
}

export default GlobalCooldown;
