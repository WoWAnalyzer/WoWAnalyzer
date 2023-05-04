import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Mind Flay has ticks marked as "cast", and we fix its channel in Channeling. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    if (
      event.ability.guid === SPELLS.MIND_FLAY.id ||
      event.ability.guid === TALENTS.SURGE_OF_INSANITY_TALENT.id //TODO: Check if this is the acutal spell cast id, because this talent has changed.
    ) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.onCast(event);
  }
}

export default GlobalCooldown;
