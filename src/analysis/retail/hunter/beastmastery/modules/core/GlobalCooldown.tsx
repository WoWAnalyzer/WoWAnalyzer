import TALENTS from 'common/TALENTS/hunter';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

class GlobalCooldown extends CoreGlobalCooldown {
  /**
   * Barrage GCDs are triggered when fabricating channel events
   */
  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === TALENTS.BARRAGE_TALENT.id) {
      return;
    }
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
