import TALENTS from 'common/TALENTS/hunter';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Haste from 'parser/shared/modules/Haste';
class GlobalCooldown extends CoreGlobalCooldown {
  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
    haste: Haste,
  };

  protected haste!: Haste;

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
