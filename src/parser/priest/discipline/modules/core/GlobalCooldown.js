import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Penance from '../spells/Penance';

/**
 * Mind Flay has ticks marked as "cast", and we fix its channel in Channeling. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  on_byPlayer_cast(event) {
    if (Penance.isPenance(event.ability.guid)) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.on_byPlayer_cast(event);
  }
}

export default GlobalCooldown;
