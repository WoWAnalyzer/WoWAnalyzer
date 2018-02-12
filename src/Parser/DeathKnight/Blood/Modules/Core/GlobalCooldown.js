import SPELLS from 'common/SPELLS';
import CoreGlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

class GlobalCooldown extends CoreGlobalCooldown {
  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.BLOODDRINKER_TALENT.id) {
      // This GCD gets handled by the `beginchannel` event
      return;
    }
    super.on_byPlayer_cast(event);
  }
}

export default GlobalCooldown;
