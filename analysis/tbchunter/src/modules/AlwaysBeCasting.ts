import { EndChannelEvent } from 'parser/core/Events';
import BaseAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import * as SPELLS from '../SPELLS';

class AlwaysBeCasting extends BaseAlwaysBeCasting {
  onEndChannel(event: EndChannelEvent) {
    if (event.ability.guid === SPELLS.AUTO_SHOT) {
      // Auto Shot cast time can overlap with the GCD (this is ideal play), when this happens we can't include both in the active time.
      // Just the GCD is active time.
      // Just the Auto Shot cast time is active time (you can't cast a SS during it).
      const lastGcd = this.globalCooldown.lastGlobalCooldown;
      if (!lastGcd) {
        this.activeTime += event.duration;
        return;
      }
      const lastGcdEndTimestamp = lastGcd.timestamp + lastGcd.duration;
      const gcdRemaining = Math.max(0, lastGcdEndTimestamp - event.timestamp);
      this.activeTime += Math.max(0, event.duration - gcdRemaining);
      return;
    }

    super.onEndChannel(event);
  }
}

export default AlwaysBeCasting;
