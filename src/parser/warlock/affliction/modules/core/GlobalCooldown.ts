import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';

/**
 * Drain Soul's cast event is actually a beginchannel event, so it shouldn't add the GCD as active time.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.DRAIN_SOUL_TALENT.id) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
