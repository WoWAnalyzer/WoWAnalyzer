import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

/**
 * Mind Flay has ticks marked as "cast", and we fix its channel in Channeling. This also fixes its GCD.
 */
class GlobalCooldown extends CoreGlobalCooldown {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id) {
      // We track Mind Flay differently
      return;
    }
    super.on_byPlayer_cast(event);
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.MIND_FLAY.id) {
      super.on_byPlayer_begincast(event);
    }
  }
}

export default GlobalCooldown;
