import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

/**
 * Crackling Jade Lightning has ticks marked as "cast", and we fix its channel in the CracklingJadeLightning module. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      // We track Crackling Jade Lightning differently
      return;
    }
    super.on_byPlayer_cast(event);
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id) {
      // This is the best indicator of when the GCD occured
      super.on_byPlayer_begincast(event);
    }
  }
}

export default GlobalCooldown;
