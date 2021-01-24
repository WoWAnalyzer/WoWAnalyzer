import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { CastEvent } from 'parser/core/Events';

import Penance from '../spells/Penance';

/**
 * Mind Flay has ticks marked as "cast", and we fix its channel in Channeling. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    if (Penance.isPenance(event.ability.guid)) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
