import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { isLivelyTotemsChainHealCast } from '../../normalizers/LivelyTotemsNormalizer';

/**
 * The Lively Totems Chain Heal is listed as cast by the player but does behave like a freecast.
 * Resolved this way to preserve the mana calculations.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    if (isLivelyTotemsChainHealCast(event)) {
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
