import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Crackling Jade Lightning has ticks marked as "cast", and we fix its channel in the CracklingJadeLightning module. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    if (
      event.ability.guid === SPELLS.CRACKLING_JADE_LIGHTNING.id ||
      event.ability.guid === TALENTS_MONK.SOOTHING_MIST_TALENT.id ||
      event.ability.guid === TALENTS_MONK.CELESTIAL_CONDUIT_TALENT.id ||
      event.ability.guid === SPELLS.MANA_TEA_CAST.id
    ) {
      // Channeling fabricates fake `beginchannel` events for these abilities, that already takes care of the GCD.
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
