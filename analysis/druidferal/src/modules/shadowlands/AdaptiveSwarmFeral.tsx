import SPELLS from 'common/SPELLS';
import uptimeBarSubStatistic, { SubPercentageStyle } from 'parser/ui/UptimeBarSubStatistic';

import { AdaptiveSwarmDamageDealer } from '@wowanalyzer/druid';

/**
 * Feral's display module for Adaptive Swarm - standard damage dealer plus also the uptime stat
 */
class AdaptiveSwarmFeral extends AdaptiveSwarmDamageDealer {
  subStatistic() {
    return uptimeBarSubStatistic(
      this.owner.fight,
      {
        spells: [SPELLS.ADAPTIVE_SWARM],
        uptimes: this.damageUptimeHistory,
      },
      [],
      SubPercentageStyle.RELATIVE,
    );
  }
}

export default AdaptiveSwarmFeral;
