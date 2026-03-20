import TALENTS from 'common/TALENTS/deathknight';
import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

class GlobalCooldown extends CoreGlobalCooldown {
  onCast(event: CastEvent) {
    super.onCast(event);
  }
}

export default GlobalCooldown;
