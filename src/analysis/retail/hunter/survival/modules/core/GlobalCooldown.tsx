import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

class GlobalCooldown extends CoreGlobalCooldown {
  /**
   * Barrage GCDs are triggered when fabricating channel events
   */
  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
