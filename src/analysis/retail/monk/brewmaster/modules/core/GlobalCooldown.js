import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Crackling Jade Lightning has ticks marked as "cast", and we fix its channel in the CracklingJadeLightning module. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event) {
    if (event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
