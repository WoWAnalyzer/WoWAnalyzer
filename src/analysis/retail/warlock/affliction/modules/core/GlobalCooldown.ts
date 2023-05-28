import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Drain Soul's cast event is actually a beginchannel event, so it shouldn't add the GCD as active time.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.DRAIN_SOUL_DEBUFF.id) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
