import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Crackling Jade Lightning has ticks marked as "cast", and we fix its channel in the CracklingJadeLightning module. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    if (event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id || event.ability.guid === SPELLS.SOOTHING_MIST.id || event.ability.guid === SPELLS.ESSENCE_FONT.id) {
      // Channeling fabricates fake `beginchannel` events for these abilities, that already takes care of the GCD.
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
