import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

/**
 * Crackling Jade Lightning has ticks marked as "cast", and we fix its channel in the CracklingJadeLightning module. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.on_byPlayer_cast(event);
  }
}

export default GlobalCooldown;
