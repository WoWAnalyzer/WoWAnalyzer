import { CastEvent } from 'parser/core/Events';
import CoreGlobalCooldown from 'parser/shared/modules/GlobalCooldown';

export default class GlobalCooldown extends CoreGlobalCooldown {
  priority = Number.NEGATIVE_INFINITY;

  static dependencies = {
    ...CoreGlobalCooldown.dependencies,
  };

  onCast(event: CastEvent) {
    // do nothing
  }
}
